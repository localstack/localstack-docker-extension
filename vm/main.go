package main

import (
	"encoding/json"
	"errors"
	"flag"
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"os"

	"github.com/labstack/echo"
	"github.com/sirupsen/logrus"
)

var ERRORS = [...]string{"Errors while converting byte[] to struct", "Errors while writing data", "Failed retrieving data"}

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
	router.GET("/get", getSettings)
	router.POST("/set", setSetting)
	router.POST("/update", updateSetting)
	router.POST("/delete", deleteSetting)

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

func getSettings(ctx echo.Context) error {
	content, err := readData()
	if err != nil {
		return ctx.JSON(http.StatusConflict, HTTPMessageBody{Message: ERRORS[2]})
	}
	return ctx.JSON(http.StatusOK, HTTPMessageBody{Message: string(content[:])})
}

func updateSetting(ctx echo.Context) error {
	var testPayload Payload
	var reqContent Configuration
	var parsedContent []Configuration
	var indexToChange int = -1

	ctx.Bind(&testPayload)
	json.Unmarshal([]byte(testPayload.Data), &reqContent)
	savedData, file, _ := readDataKeepOpen()
	defer file.Close()
	fmt.Println("loaded data:" + string(savedData))

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
	var testPayload Payload
	var idToDelete string
	var parsedContent []Configuration
	var indexToDelete int = -1

	ctx.Bind(&testPayload)
	idToDelete = testPayload.Data
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
	if err == nil {
		return ctx.NoContent(http.StatusOK)
	}
	return ctx.JSON(http.StatusInternalServerError, HTTPMessageBody{Message: ERRORS[1]})
}

func setSetting(ctx echo.Context) error {

	var testPayload Payload
	var reqContent Configuration
	var parsedContent []Configuration

	ctx.Bind(&testPayload)
	json.Unmarshal([]byte(testPayload.Data), &reqContent)
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

func readData() ([]byte, error) {
	_, err := os.Stat("data.json")
	var content []byte

	if errors.Is(err, os.ErrNotExist) {
		logrus.New().Infof("File not exist, creating")
		file, err := os.Create("data.json")

		if err != nil {
			logrus.New().Infof("Errors while creating file")
			logrus.New().Infof(err.Error())
		}
		_, err = file.Write([]byte("[]"))
		file.Close()
		return content, err
	}

	content, err = os.ReadFile("data.json")
	return content, err
}

func readDataKeepOpen() ([]byte, *os.File, error) {
	_, err := os.Stat("data.json")
	var content []byte

	if errors.Is(err, os.ErrNotExist) {

		file, err := os.OpenFile("data.json", os.O_CREATE, 0755)

		if err != nil {
			logrus.New().Infof("Errors while creating file")
			logrus.New().Infof(err.Error())
		}
		_, err = file.Write([]byte("[]"))
		return content, file, err
	}

	file, err := os.OpenFile("data.json", os.O_RDWR, 0755)
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
	fmt.Println("File content:" + string(content))
	return content, file, err
}

func writeData(data []Configuration, file *os.File) error {
	jsonData, err := json.Marshal(data)
	fmt.Print("Len to write: ")
	fmt.Println(len(jsonData))
	if err == nil {
		file.Truncate(0)
		_, err = file.WriteAt(jsonData, 0)
	}
	return err
}
