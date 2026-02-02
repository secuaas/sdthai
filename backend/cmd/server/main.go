package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Configuration
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Mode release en production
	if os.Getenv("ENV") == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Créer le routeur
	router := gin.Default()

	// Configuration CORS
	corsOrigins := os.Getenv("CORS_ORIGINS")
	if corsOrigins == "" {
		corsOrigins = "http://localhost:5173"
	}
	origins := strings.Split(corsOrigins, ",")

	router.Use(cors.New(cors.Config{
		AllowOrigins:     origins,
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	// Servir les fichiers statiques en production
	if os.Getenv("ENV") == "production" {
		router.Static("/assets", "./public/assets")
		router.StaticFile("/", "./public/index.html")
		router.NoRoute(func(c *gin.Context) {
			c.File("./public/index.html")
		})
	}

	// API Health check
	router.GET("/api/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "healthy",
			"service": "sdthai",
			"type":    "fullstack",
		})
	})

	// Routes API
	api := router.Group("/api/v1")
	{
		api.GET("/", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{
				"message":     "Welcome to sdthai API",
				"description": "SDThai Platform",
			})
		})

		// Exemple d'endpoint
		api.GET("/example", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{
				"data": []string{"item1", "item2", "item3"},
			})
		})
	}

	// Démarrer le serveur
	addr := fmt.Sprintf(":%s", port)
	log.Printf("Starting sdthai server on %s", addr)

	if err := router.Run(addr); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
