// package main

// import (
// 	"encoding/json"
// 	"log"
// 	"net/http"
// )

// // Esta es la función que responde cuando alguien entra a la página
// func healthCheck(w http.ResponseWriter, r *http.Request) {
// 	// Le decimos al navegador/Gateway que le vamos a enviar JSON
// 	w.Header().Set("Content-Type", "application/json")

// 	// Creamos la respuesta
// 	response := map[string]string{
// 		"service": "Booking Engine (Go)",
// 		"status":  "active",
// 		"data":    "Ready for bookings",
// 	}

// 	// Enviamos la respuesta codificada
// 	json.NewEncoder(w).Encode(response)
// }

// func main() {
// 	// Definimos que cuando entren a la raíz "/", se ejecute la función healthCheck
// 	http.HandleFunc("/", healthCheck)

// 	// Imprimimos en consola para saber que arrancó
// 	log.Println("🚀 Booking Engine corriendo en el puerto 3003...")

// 	// Arrancamos el servidor en el puerto 3003 (Crítico: debe coincidir con tu Docker)
// 	if err := http.ListenAndServe(":3003", nil); err != nil {
// 		log.Fatal(err)
// 	}
// }

//-------------------------------------------------------------------------------------------------------------

package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	// Importamos el driver de Postgres (el guión bajo es importante)
	_ "github.com/lib/pq"
)

// Variable global para la conexión (en prod usaríamos inyección de dependencias)
var db *sql.DB

func healthCheck(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Verificamos si la DB responde al ping
	dbStatus := "Connected"
	if err := db.Ping(); err != nil {
		dbStatus = fmt.Sprintf("Error: %v", err)
	}

	response := map[string]string{
		"service":   "Booking Engine (Go)",
		"status":    "active",
		"db_engine": "PostgreSQL",
		"db_status": dbStatus,
	}

	json.NewEncoder(w).Encode(response)
}

func main() {
	var err error

	// 1. Leemos la configuración del entorno (Docker)
	dbDriver := os.Getenv("DB_DRIVER")
	dbSource := os.Getenv("DB_SOURCE")

	if dbDriver == "" {
		log.Fatal("DB_DRIVER no está configurado en las variables de entorno")
	}

	// 2. Abrimos la conexión
	log.Println("🔌 Intentando conectar a:", dbDriver)
	db, err = sql.Open(dbDriver, dbSource)
	if err != nil {
		log.Fatal("Error abriendo la conexión a BD:", err)
	}

	// 3. Probamos la conexión (Ping)
	// Nota: sql.Open no conecta inmediatamente, Ping sí valida la conexión.
	if err = db.Ping(); err != nil {
		log.Printf("⚠️ Advertencia: No se pudo conectar a la BD al inicio: %v", err)
		// No hacemos Fatal aquí para dejar que el contenedor arranque y reintente luego,
		// pero idealmente en K8s usaríamos liveness probes.
	} else {
		log.Println("✅ Conexión exitosa a PostgreSQL")
	}

	// 4. Arrancamos el servidor
	http.HandleFunc("/", healthCheck)
	log.Println("🚀 Booking Engine corriendo en el puerto 3003...")

	if err := http.ListenAndServe(":3003", nil); err != nil {
		log.Fatal(err)
	}
}
