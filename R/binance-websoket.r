


# install.packages("httr")
# install.packages("sparklyr")
# install.packages("dplyr")
# install.packages("websocket")
# install.packages("jsonlite")
# install.packages("tidyr")
# install.packages("mongolite")
# install.packages("dotenv")

library(httr)
library(sparklyr)
library(dplyr)
library(websocket)
library(jsonlite)
library(tidyr)
library(mongolite)
library(glue)
library(dotenv)

dotenv::load_dot_env()

# print(spark_available_versions())
# spark_installed_versions()[1, 3] %>% spark_home_set()

# conf <- spark_config()
# conf$sparklyr.defaultPackages <- c("org.mongodb.spark:mongo-spark-connector_2.12:3.0.1")
# conf$spark.mongodb.input.uri="mongodb+srv://Nathan:QqRSJzkvex7npZu3@cluster0.nulqw3e.mongodb.net"

# sc <- spark_connect(
#   master = "local",
#   # config = conf
# )

save_path <- "./"

mongo_conn <- mongo(
  collection = "Tickertestwebsocket",
  db = "BinanceR",
  url = Sys.getenv("MONGO_URL"),
  verbose = TRUE,
  options = ssl_options(weak_cert_validation = FALSE)
)

# mongo_conn$update('{"symbol":"FLOKIUSDT"}', '{"$set":{"e":"24hrTicker","E":"1.718271e+12","symbol":"SOLUSDC","prevClosePrice":"-1.16000000","priceChange":"-0.762","weightedAvgPrice":"156.65549191","x":"151.42000000","lastPrice":"151.15000000","lastQty":"0.16100000","bidPrice":"150.42000000","bidQty":"15.30000000","askPrice":"152.43000000","askQty":"5.28600000","openPrice":"152.31000000","highPrice":"160.64000000","lowPrice":"150.00000000","volume":"207.74000000","quoteVolume":"32543.61189000","openTime":"1.718185e+12","closeTime":"1.718271e+12","firstId":"  112283","lastId":"  112385","count":"  103"}}', upsert = TRUE)
# Sys.sleep(1000000)

key_mapping <- list(
  symbol = "s",
  askPrice = "a",
  askQty = "A",
  bidPrice = "b",
  bidQty = "B",
  closeTime = "C",
  count = "n",
  firstId = "F",
  highPrice = "h",
  lastId = "L",
  lastPrice = "c",
  lastQty = "Q",
  lowPrice = "l",
  openPrice = "o",
  openTime = "O",
  prevClosePrice = "p",
  priceChange = "P",
  priceChangePercent = "P",
  quoteVolume = "q",
  volume = "v",
  weightedAvgPrice = "w"
)

replace_keys <- function(datag) {
  data <- data.frame(fromJSON(datag))
  for (x in names(data)) {
    i <- 1
    for (y in key_mapping) {
      if (x == y) {
        names(data)[names(data) == x] <- names(key_mapping)[i]
      }
      i <- i + 1
    }
  }
  data
}

handle_message <- function(message = "") {
  new_message <- replace_keys(message)

  # enregister le payload
  # file_name <- paste0(save_path, "test.json")
  # write(toJSON(new_message), file_name, append = FALSE)

  # json_DF <- spark_read_json(
  #   sc      = sc,
  #   name    = "jsonTable",
  #   path    = file_name,
  #   options = list("multiLine" = TRUE),
  #   columns = c(
  #     e = "character",
  #     "_e" = "integer",
  #     s = "character",
  #     p = "character",
  #     "_p" = "character",
  #     w = "character",
  #     x = "character",
  #     c = "character",
  #     "_q" = "character",
  #     b = "character",
  #     "_b" = "character",
  #     a = "character",
  #     "_a" = "character",
  #     o = "character",
  #     h = "character",
  #     l = "character",
  #     v = "character",
  #     q = "character",
  #     "_o" = "integer",
  #     "_c" = "integer",
  #     "_f" = "integer",
  #     "_l" = "integer",
  #     n = "integer"
  #   )
  # )

  apply(new_message, 1, function(row) {
    where <- glue('{{"symbol":"{row["symbol"]}"}}')
    row_json <- toJSON(as.list(row), auto_unbox = TRUE)
    if (jsonlite::validate(row_json)) {
      print("yep")
      mongo_conn$update(
        glue('{where}'),
        glue('{{"$set":{row_json}}}'),
        upsert = TRUE
      )
    } else {
      print(glue('{where} {{"$set":{row_json}}}'))
    }
  })
}

ws <- WebSocket$new("wss://stream.binance.us:9443/ws/!ticker@arr")

ws$onMessage(function(event = NULL) {
  if (nzchar(event$data)) {
    print("Received message")
    handle_message(event$data)
  }
})

ws$onOpen(function(event) {
  print("Connected to Binance WebSocket")
})

ws$onClose(function(event) {
  print("Disconnected from Binance WebSocket")
})

ws$onError(function(event) {
  print(paste("Error:", event$message))
})