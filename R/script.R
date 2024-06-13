install.packages("httr")
install.packages("sparklyr")
install.packages("dplyr")
install.packages("jsonlite")
install.packages("mongolite")
install.packages("caret")
install.packages("ggplot2")

library(httr)
library(sparklyr)
library(dplyr)
library(jsonlite)
library(mongolite)
library(ggplot2)
library(caret)


Sys.setenv(JAVA_HOME = "C:/Program Files/Java/jdk-22")
Sys.setenv(SPARK_HOME = "C:/spark/spark-3.5.1-bin-hadoop3")

log_dir <- file.path(Sys.getenv("SPARK_HOME"), "logs")
if (!dir.exists(log_dir)) {
  dir.create(log_dir, recursive = TRUE)
}

conf <- spark_config()
conf$sparklyr.shell.conf <- list(
  "spark.driver.extraJavaOptions" = "-Dlog4j.configuration=file:///path/to/log4j.properties",
  "spark.hadoop.fs.hdfs.impl" = "org.apache.hadoop.hdfs.DistributedFileSystem",
  "spark.hadoop.fs.file.impl" = "org.apache.hadoop.fs.LocalFileSystem"
)

sc <- spark_connect(master = "local", config = conf)


if (spark_connection_is_open(sc)) {
  print("Connexion à Spark établie avec succès.")
}

get_binance_data <- function() {
  res <- GET("https://api.binance.us/api/v3/ticker/24hr")
  if (status_code(res) == 200) {
    return(content(res, as = "parsed", type = "application/json"))
  } else {
    print(paste("Erreur lors de la récupération des données de marché de Binance. Statut de la réponse:", status_code(res)))
    return(NULL)
  }
}

mongo_conn <- mongo(collection = "Ticker", db = "BinanceR", url = "mongodb+srv://Pablo:9y1F4t3wzZ8j6uGn@cluster0.nulqw3e.mongodb.net")

update_data_mongo <- function(data) {
  for (item in data) {
    query <- list(symbol = item$symbol)
    update <- list(
      '$set' = list(lastPrice = item$lastPrice), 
      '$push' = list(lastPriceList = item$lastPrice)
    )
    
    query_json <- toJSON(query, auto_unbox = TRUE)
    update_json <- toJSON(update, auto_unbox = TRUE)
    
    mongo_conn$update(query_json, update_json, upsert = TRUE)
  }
}

print_btcusdt_prices <- function() {
  btcusdt_data <- mongo_conn$find('{"symbol": "BTCUSDT"}', '{"lastPriceList": 1, "_id": 0}')
  if (nrow(btcusdt_data) > 0) {
    last_prices <- btcusdt_data$lastPriceList[[1]]
    num_prices <- length(last_prices)
    print(paste("Nombre d'éléments dans la liste des prix pour BTCUSDT :", num_prices))
    print(paste("Les 10 derniers prix pour BTCUSDT :", toString(tail(last_prices, 10))))
  } else {
    print("Aucune donnée trouvée pour BTCUSDT.")
  }
}

while (TRUE) {
  start_time <- Sys.time()
  response1 <- get_binance_data()
  if (!is.null(response1)) {
    update_data_mongo(response1)
    
    end_time <- Sys.time()
    print(paste("Les données ont été insérées dans MongoDB avec succès à", end_time, "après", round(difftime(end_time, start_time, units = "secs"), 2), "secondes"))
    print_btcusdt_prices()
  } else {
    print("Aucune donnée à insérer dans MongoDB.")
  }
  
  Sys.sleep(5)
}


load_data_for_ml <- function() {
  btcusdt_data <- mongo_conn$find('{"symbol": "BTCUSDT"}', '{"lastPriceList": 1, "_id": 0}')
  if (nrow(btcusdt_data) > 0) {
    last_prices <- unlist(btcusdt_data$lastPriceList[[1]])
    df <- data.frame(time = 1:length(last_prices), lastPrice = as.numeric(last_prices))
    return(df)
  } else {
    print("Aucune donnée trouvée pour BTCUSDT.")
    return(NULL)
  }
}

prepare_data <- function(df) {
  df$time <- as.numeric(df$time)
  df$lastPrice <- as.numeric(df$lastPrice)
  df$time <- scale(df$time)
  df$lastPrice <- scale(df$lastPrice)
  return(df)
}

apply_linear_regression <- function(df) {
  model <- lm(lastPrice ~ time, data = df)
  print(summary(model))
  return(model)
}

visualize_data <- function(df, model) {
  # Créer un DataFrame avec les prédictions
  df$predicted <- predict(model, newdata = df)
  
  p <- ggplot(df, aes(x = time)) +
    geom_point(aes(y = lastPrice), color = 'blue', alpha = 0.5) +
    geom_line(aes(y = predicted), color = 'red') +
    labs(title = "Régression linéaire des prix BTCUSDT",
         x = "Temps",
         y = "Prix normalisé")
  
  print(p)
}

df <- load_data_for_ml()
if (!is.null(df)) {
  df <- prepare_data(df)
  model <- apply_linear_regression(df)
  visualize_data(df, model)
}
