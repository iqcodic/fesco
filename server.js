const express = require('express');
const { scrapeBill } = require('./scraper');
const app = express();
app.use(express.json());

app.post('/api/bill', async (req, res) => {
  const { ref } = req.body;
  if (!ref) return res.status(400).json({ error: 'Reference required' });
  try {
    const data = await scrapeBill(ref);
    return res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: err.message });
  }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
