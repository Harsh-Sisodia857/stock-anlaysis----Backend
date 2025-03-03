// Function to get stock by name
function getStockByName(name) {
  return stocks.find(
    (stock) => stock.name.toLowerCase() === name.toLowerCase()
  );
}

// Function to get stock by ticker
function getStockByTicker(ticker) {
  return stocks.find(
    (stock) => stock.ticker.toLowerCase() === ticker.toLowerCase()
  );
}

// Function to delete stock by ticker
function deleteStockByTicker(ticker) {
  const stockIndex = stocks.findIndex(
    (stock) => stock.ticker.toLowerCase() === ticker.toLowerCase()
  );

  if (stockIndex !== -1) {
    // Remove stock from array
    stocks.splice(stockIndex, 1);
    console.log(`Stock with ticker ${ticker} has been deleted.`);
  } else {
    console.log(`Stock with ticker ${ticker} not found.`);
  }
}

// Function to update stock by ticker
function updateStockByTicker(ticker, updatedFields) {
  const stock = getStockByTicker(ticker);

  if (stock) {
    // Update the stock fields with the provided updatedFields object
    Object.assign(stock, updatedFields);
    console.log(`Stock with ticker ${ticker} has been updated.`);
  } else {
    console.log(`Stock with ticker ${ticker} not found.`);
  }
}

module.exports = {
  updateStockByTicker,
  deleteStockByTicker,
  getStockByTicker,
  getStockByName,
};
