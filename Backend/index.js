const express = require('express');
const axios = require('axios');
var cors = require('cors')
const app = express();
const PORT = 8888
app.use(cors())
const data_given = {
    "companyName": "TrainCentral",
    "clientID": "31ec66a1-ca05-466f-b65e-590f3a43b131",
     "ownerName": "Diaz",
    "ownerEmail": "diaz123@abc.edu",
    "rollNo": "1602-20-733-304",
     "clientSecret": "vUtXaQHrOqxrwbCX"
    };
async function getToken(data_given) {
    try {
      const response = await axios.post('http://20.244.56.144/train/auth', data_given);
      const token = response.data.access_token;
      
      return token;
    } catch (error) {
      console.error('Error generatin token:', error);
      throw error;
    }
  }
  setInterval(async () => {
    auth_token = await getToken({
        "companyName": "TrainCentral",
        "clientID": "31ec66a1-ca05-466f-b65e-590f3a43b131",
         "ownerName": "Diaz",
        "ownerEmail": "diaz123@abc.edu",
        "rollNo": "1602-20-733-304",
         "clientSecret": "vUtXaQHrOqxrwbCX"
        });
  }, 60000);

async function fetchTrains() 
{
  const AUTH_TOKEN = await getToken(data_given);
  console.log(AUTH_TOKEN)
  try {
    const headers = {
      Authorization: `Bearer ${AUTH_TOKEN}`,
    };
    const resp = await axios.get('http://20.244.56.144/train/trains', { headers });
    const trainsData = resp.data;
    return trainsData;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error; 
  }
}

function sortingTrains(trains_data) {
    trains_data.sort((a, b) => {
      // Sort  price in asce order
      const PriceComp = a.price.AC - b.price.AC;
  
      if (PriceComp !== 0) {
        return PriceComp;
      } else {
        // If price is the same, sort by seatsAvailable in desc order
        const seatsAvailableComparison = b.seatsAvailable.AC - a.seatsAvailable.AC;
        if (seatsAvailableComparison !== 0) {
          return seatsAvailableComparison;
        } else {
          // If price and seatsAvailable are the same, sort by departureTime in desc order
          const dtc = new Date(b.departureTime.Hours, b.departureTime.Minutes) - new Date(a.departureTime.Hours, a.departureTime.Minutes);
          return dtc;
        }
      }
    });
  
    // Filter trains where departure time > 30
    const sortedTrains = trains_data.filter(train => train.departureTime.Minutes > 30);
  
    return sortedTrains;
  }
  
app.get('/get_train_data', async (req, res) => {
  try {
    const trainsData = await fetchTrains(); 
    let trains_data= trainsData
     let sorted_trains = sortingTrains(trains_data);
    res.json(sorted_trains);
  } catch (error) {
    console.error('Error handling request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/train/:num', async (req, res) => {
    try {
      const train_num = req.params.num;
      const AUTH_TOKEN = await getToken(data_given);
      
      const headers = {
        Authorization: `Bearer ${AUTH_TOKEN}`,
      };
  
      const tdata = await axios.get(`http://20.244.56.144/train/trains/${train_num}`, { headers });
      res.json(tdata.data);
  
    } catch (error) {
      console.error('Error fetching ', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
