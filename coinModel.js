const mongoose = require("mongoose");

const coinSchema = mongoose.Schema(
  {
    specNo: {
      type: String,
      required: true,
      unique: true,
    },
    coinName: {
      type: String,
      required: true,
      unique: true,
    },
    array: [
      {
        GradeName: String,
        PopulationCount: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// utility general function not unique
coinSchema.statics.deleteOldData = async function() {
  // delete old data
  const date = new Date(Date.now());
  date.setHours(0, 0, 0, 0);
  const oneWeekAgo = new Date(Date.now());
  const pastDate = oneWeekAgo.getDate() - 7;
  oneWeekAgo.setDate(pastDate);

  await this.deleteMany({
    createdAt: {
      $gte: date,
     }, // 16 < 17 wont delete it prevent duplicates for one day
  });
  await this.deleteMany({
    createdAt: {
      $lt: pastDate,
     }, // from 1 week ago
  });
}

const Coin = mongoose.model("Coins", coinSchema);

module.exports = Coin;
