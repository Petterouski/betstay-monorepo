package main

import (
	"fmt"
	"log"
	"net/http"
)

func main() {
	// Definimos una ruta básica
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "¡NUEVOOOO Booking Engine (Go) está vivo y escuchando! 🐹")
	})

	// El puerto debe coincidir con el EXPOSE del Dockerfile (3003)
	port := ":3003"
	fmt.Println("Server starting on port", port)

	// Iniciamos el servidor (esto bloquea el proceso para que no muera)
	err := http.ListenAndServe(port, nil)
	if err != nil {
		log.Fatal("Error starting server: ", err)
	}
}
