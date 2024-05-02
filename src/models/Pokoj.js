const mongoose = require('mongoose');

const pokojSchema = new mongoose.Schema({
  nazev: String,
  popis: String,
  cena: Number,
  fotky: [String],
  hodnocení: { type: Number, default: 0 },
  rezervovano: { type: Boolean, default: false },
  rezervace: {
    od: Date,
    do: Date
  }
});

const Pokoj = mongoose.model('Pokoj', pokojSchema);

module.exports = Pokoj;
