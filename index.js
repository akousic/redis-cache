const express = require('express');
const redis = require('redis');
const axios = require('axios');
const bodyParser = require('body-parser');

const port_redis = process.env.PORT || 6379;
const port = process.env.PORT || 3000;

const redis_client = redis.createClient(port_redis);

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.listen(port, () => console.log(`server running on port ${port}`));
 
checkCache = (req, res, next) =>{
    const {id} = req.params;
    redis_client.get(id, (err,data)=>{
        if(err) {
            console.log(err);
            res.status(500).send(error);
        }
        if(data!= null){
            res.send(data);
        }
        else next();
    })
}
app.get('/starships/:id',checkCache, async (req, res) => {
    try {
        const { id } = req.params;
        const starShipInfo = await axios.get(`https://swapi.co/api/starships/${id}`);
        const starShipInfoData = starShipInfo.data;
        //add data to Redis
redis_client.setex(id, 3600, JSON.stringify(starShipInfoData));
        return res.json(starShipInfoData);
    } catch (error) {
        console.log(error);
        return res.status(500).json(error);
    }

});


