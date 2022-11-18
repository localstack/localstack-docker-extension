package main

import (
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
	router.GET("/getConfig", getSettings)
	router.POST("/setConfig", setSettings)

	log.Fatal(router.Start(startURL))
}

func listen(path string) (net.Listener, error) {
	return net.Listen("unix", path)
}

func getSettings(ctx echo.Context) error {

	_, err := os.Stat("data.json")

	if errors.Is(err, os.ErrNotExist) {
		logrus.New().Infof("File not exist, creating")
		file, err := os.Create("data.json")
		file.Close()
		if err != nil {
			logrus.New().Infof("Errors while creating file")
			logrus.New().Infof(err.Error())
		}
	}

	content, err := os.ReadFile("data.json")
	if err != nil {
		return ctx.JSON(http.StatusConflict, HTTPMessageBody{Message: "Failed"})
	}
	return ctx.JSON(http.StatusOK, HTTPMessageBody{Message: string(content[:])})
}

type Payload struct {
	Data string `json:"data"`
}

func setSettings(ctx echo.Context) error {
	var payload Payload
	ctx.Bind(&payload)
	err := os.WriteFile("data.json", []byte(payload.Data), 0644)
	if err != nil {
		logrus.New().Infof(err.Error())
		return ctx.NoContent(http.StatusInternalServerError)
	}

	return ctx.NoContent(http.StatusOK)
}

type HTTPMessageBody struct {
	Message string
}
