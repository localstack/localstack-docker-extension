package main

import (
	"encoding/json"
	"errors"
	"flag"
	"io"
	"log"
	"net"
	"net/http"
	"os"

	"github.com/labstack/echo"
	"github.com/sirupsen/logrus"
)

var ERRORS = [...]string{"Bad format", "Errors while saving data", "Failed retrieving data", "Configuration already present"}

const CONFIG_FILE = "data.json"
const MOUNT_POINT_FILE = "mountPoint.txt"

func main() {
	var socketPath string
	flag.StringVar(&socketPath, "socket", "/run/guest/volumes-service.sock", "Unix domain socket to listen on")
	flag.Parse()

	os.RemoveAll(socketPath)

	logrus.New().Infof("Starting listening on %s\n", socketPath)
	router := echo.New()
	router.HideBanner = true

	startURL := ""

	ln, err := listen(socketPath)
	if err != nil {
		log.Fatal(err)
	}
	router.Listener = ln
	os.Chdir("/saved_config")
	router.GET("/configs", getSettings)
	router.POST("/configs", createSetting)
	router.PUT("/configs", updateSetting)
	router.DELETE("/configs/:id", deleteSetting)
	router.GET("/mount", getMount)
	router.POST("/mount", setMount)
	router.DELETE("/mount", deleteMount)

	log.Fatal(router.Start(startURL))
}

func listen(path string) (net.Listener, error) {
	return net.Listen("unix", path)
}

type HTTPMessageBody struct {
	Message string
}

type Configuration struct {
	Name string `json:"name"`
	ID   string `json:"id"`
	Vars []struct {
		Variable string `json:"variable"`
		Value    string `json:"value"`
		ID       string `json:"id"`
	} `json:"vars"`
}

type Payload struct {
	Data string `json:"data"`
}

func getMount(ctx echo.Context) error {
	content, err := readData(MOUNT_POINT_FILE)
	if err != nil {
		return ctx.JSON(http.StatusConflict, HTTPMessageBody{Message: ERRORS[2]})
	}
	return ctx.JSON(http.StatusOK, HTTPMessageBody{Message: string(content[:])})
}

func setMount(ctx echo.Context) error {
	var payload Payload

	ctx.Bind(&payload)
	err := os.WriteFile(MOUNT_POINT_FILE, []byte(payload.Data), 0644)
	if err != nil {
		return ctx.JSON(http.StatusConflict, HTTPMessageBody{Message: ERRORS[2]})
	}
	return ctx.NoContent(http.StatusOK)
}

func deleteMount(ctx echo.Context) error {
	if err := os.Truncate(MOUNT_POINT_FILE, 0); err != nil {
		return ctx.JSON(http.StatusConflict, HTTPMessageBody{Message: ERRORS[1]})
	}
	return ctx.NoContent(http.StatusOK)
}

func getSettings(ctx echo.Context) error {
	content, err := readData(CONFIG_FILE)
	if err != nil {
		return ctx.JSON(http.StatusConflict, HTTPMessageBody{Message: ERRORS[2]})
	}
	return ctx.JSON(http.StatusOK, HTTPMessageBody{Message: string(content[:])})
}

func updateSetting(ctx echo.Context) error {
	var payload Payload
	var reqContent Configuration
	var parsedContent []Configuration
	var indexToChange int = -1

	ctx.Bind(&payload)
	json.Unmarshal([]byte(payload.Data), &reqContent)
	savedData, file, _ := readDataKeepOpen()
	defer file.Close()

	err := json.Unmarshal(savedData, &parsedContent)

	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, HTTPMessageBody{Message: ERRORS[0]})
	}

	for index, item := range parsedContent {
		if item.ID == reqContent.ID {
			indexToChange = index
		}
	}

	if indexToChange == -1 { //no config with that id found
		parsedContent = append(parsedContent, reqContent)
	} else {
		parsedContent[indexToChange] = reqContent
	}

	err = writeData(parsedContent, file)
	if err == nil {
		return ctx.NoContent(http.StatusOK)
	}
	return ctx.JSON(http.StatusInternalServerError, HTTPMessageBody{Message: ERRORS[1]})
}

func deleteSetting(ctx echo.Context) error {

	var idToDelete string
	var parsedContent []Configuration
	var indexToDelete int = -1

	idToDelete = ctx.Param("id")
	savedData, file, _ := readDataKeepOpen()
	defer file.Close()
	err := json.Unmarshal(savedData, &parsedContent)

	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, HTTPMessageBody{Message: ERRORS[0]})
	}

	for index, item := range parsedContent {
		if item.ID == idToDelete {
			indexToDelete = index
		}
	}

	if indexToDelete != -1 {
		if indexToDelete != len(parsedContent)-1 {
			parsedContent[indexToDelete] = parsedContent[len(parsedContent)-1]
		}
		parsedContent = parsedContent[:len(parsedContent)-1]
	}

	err = writeData(parsedContent, file)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, HTTPMessageBody{Message: ERRORS[1]})
	}

	return ctx.NoContent(http.StatusOK)

}

func createSetting(ctx echo.Context) error {

	var payload Payload
	var reqContent Configuration
	var parsedContent []Configuration

	ctx.Bind(&payload)
	json.Unmarshal([]byte(payload.Data), &reqContent)
	savedData, file, _ := readDataKeepOpen()
	defer file.Close()
	err := json.Unmarshal(savedData, &parsedContent)

	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, HTTPMessageBody{Message: ERRORS[0]})
	}

	updatedArray := append(parsedContent, reqContent)
	err = writeData(updatedArray, file)

	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, HTTPMessageBody{Message: ERRORS[1]})
	}

	return ctx.NoContent(http.StatusOK)

}

func readData(fileName string) ([]byte, error) {
	_, err := os.Stat(fileName)
	var content []byte

	if errors.Is(err, os.ErrNotExist) {
		content, file, err := createFile(fileName)
		file.Close()
		return content, err
	}

	content, err = os.ReadFile(fileName)
	return content, err
}

func readDataKeepOpen() ([]byte, *os.File, error) {
	_, err := os.Stat(CONFIG_FILE)
	var content []byte

	if errors.Is(err, os.ErrNotExist) {
		return createFile(CONFIG_FILE)
	}

	file, err := os.OpenFile(CONFIG_FILE, os.O_RDWR, 0755)
	var buff = make([]byte, 1024)
	if err == nil {
		for {
			n, err := file.Read(buff)
			if err == io.EOF {
				break
			}
			content = append(content, buff[:n]...)
		}
	}
	return content, file, err
}

func writeData(data []Configuration, file *os.File) error {
	jsonData, err := json.Marshal(data)
	if err == nil {
		file.Truncate(0)
		_, err = file.WriteAt(jsonData, 0)
	}
	return err
}

func createFile(filename string) ([]byte, *os.File, error) {

	logrus.New().Infof("File not exists, creating")
	file, err := os.OpenFile(filename, os.O_CREATE|os.O_RDWR, 0755)

	if err != nil {
		logrus.New().Infof("Errors while creating file")
		logrus.New().Infof(err.Error())
	}
	st, err := file.Stat()
	if err != nil {
		logrus.New().Infof(err.Error())
	} else {
		if st.Size() == 0 && filename == CONFIG_FILE {
			_, err = file.Write([]byte("[]"))
		}
	}

	var toReturn []byte
	return toReturn, file, err
}
