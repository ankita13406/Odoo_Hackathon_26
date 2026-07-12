require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const employeeRoutes = require("./routes/employee.routes");

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (req, res) => res.json({ success: true, data: 'AssetFlow API running' }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/departments', require('./routes/departments'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/assets', require('./routes/asset.routes'));
app.use('/api/copilot', require('./routes/copilot'));
app.use('/api/dashboard', require('./routes/dashboard'));

app.use("/api/employees", employeeRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ success: false, error: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server on http://localhost:${PORT}`));