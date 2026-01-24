package main

import (
	"encoding/json"
	"log"
	"net/http"
)

// Esta es la función que responde cuando alguien entra a la página
func healthCheck(w http.ResponseWriter, r *http.Request) {
	// Le decimos al navegador/Gateway que le vamos a enviar JSON
	w.Header().Set("Content-Type", "application/json")

	// Creamos la respuesta
	response := map[string]string{
		"service": "Booking Engine (Go)",
		"status":  "active",
		"data":    "Ready for bookings",
	}

	// Enviamos la respuesta codificada
	json.NewEncoder(w).Encode(response)
}

func main() {
	// Definimos que cuando entren a la raíz "/", se ejecute la función healthCheck
	http.HandleFunc("/", healthCheck)

	// Imprimimos en consola para saber que arrancó
	log.Println("🚀 Booking Engine corriendo en el puerto 3003...")

	// Arrancamos el servidor en el puerto 3003 (Crítico: debe coincidir con tu Docker)
	if err := http.ListenAndServe(":3003", nil); err != nil {
		log.Fatal(err)
	}
}
