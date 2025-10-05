package main

import (
    "github.com/gofiber/fiber/v2"
    "Injera--Gebeya-Platform/Server/config"
)

func main() {
    app := fiber.New()
    config.ConnectDatabase()

    app.Get("/", func(c *fiber.Ctx) error {
        return c.SendString("Server running!")
    })

    app.Listen(":3000")
}
