package main

import (
	"encoding/json"
	"errors"
	"flag"
	"log"
	"net"
	"net/http"
	"os"

	"github.com/labstack/echo"
	"github.com/sirupsen/logrus"
)

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
		return ctx.JSON(http.StatusConflict, HTTPMessageBody{Message: "Failed"})
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
	savedData, _ := readData()
	err := json.Unmarshal(savedData, &parsedContent)

	if err != nil {
		return ctx.NoContent(http.StatusInternalServerError)
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

	err = writeData(parsedContent)
	if err == nil {
		return ctx.NoContent(http.StatusOK)
	}
	return ctx.NoContent(http.StatusInternalServerError)
}

func deleteSetting(ctx echo.Context) error {
	var testPayload Payload
	var idToDelete string
	var parsedContent []Configuration
	var indexToDelete int = -1

	ctx.Bind(&testPayload)
	idToDelete = testPayload.Data
	savedData, _ := readData()
	err := json.Unmarshal(savedData, &parsedContent)

	if err != nil {
		return ctx.NoContent(http.StatusInternalServerError)
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

	err = writeData(parsedContent)
	if err == nil {
		return ctx.NoContent(http.StatusOK)
	}
	return ctx.NoContent(http.StatusInternalServerError)
}

func setSetting(ctx echo.Context) error {

	var testPayload Payload
	var reqContent Configuration
	var parsedContent []Configuration

	ctx.Bind(&testPayload)
	json.Unmarshal([]byte(testPayload.Data), &reqContent)
	savedData, _ := readData()
	err := json.Unmarshal(savedData, &parsedContent)

	if err != nil {
		return ctx.NoContent(http.StatusInternalServerError)
	}

	updatedArray := append(parsedContent, reqContent)
	err = writeData(updatedArray)

	if err != nil {
		logrus.New().Infof("Errors while writing data")
		return ctx.NoContent(http.StatusInternalServerError)
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

func writeData(data []Configuration) error {
	jsonData, err := json.Marshal(data)
	if err == nil {
		err = os.WriteFile("data.json", jsonData, 0644)
	}
	return err
}
