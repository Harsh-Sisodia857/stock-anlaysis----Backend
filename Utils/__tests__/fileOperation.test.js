const fs = require("fs");
const path = require("path");
const { getAllStock } = require("../fileOperations");
const { downloadFileFromS3 } = require("../../Config/fileDownload");

jest.mock("fs", () => ({
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
  mkdirSync: jest.fn(),
}));

jest.mock("../../Config/fileDownload", () => ({
  downloadFileFromS3: jest.fn(),
}));

describe("getAllStock function", () => {
  const mockStockData = [
    { ticker: "AAPL", name: "Apple Inc." },
    { ticker: "GOOGL", name: "Alphabet Inc." },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.STOCK_KEY = "dummy_stock_key";
  });

  test("should return stock data from cache if available", async () => {
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue(JSON.stringify(mockStockData));

    const stocks = await getAllStock();
    expect(stocks).toEqual(mockStockData);
    expect(downloadFileFromS3).not.toHaveBeenCalled();
  });

  test("should fetch stock data from S3 if cache is not available", async () => {
    fs.existsSync.mockReturnValue(false);
    downloadFileFromS3.mockResolvedValue(mockStockData);

    const stocks = await getAllStock();
    expect(stocks).toEqual(mockStockData);
    expect(downloadFileFromS3).toHaveBeenCalledWith("dummy_stock_key");
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      path.join(__dirname, "../../Cache", "stocks.json"),
      JSON.stringify(mockStockData, null, 2),
      "utf-8"
    );
  });
});
