const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const sightingRoutes = require('./routes/sightings')
const cors = require('cors');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/sightings', sightingRoutes);

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Conntected to DB'))
.catch(err => console.error('DB connection failed:', err));

const PORT = process.env.PORT || 443;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));