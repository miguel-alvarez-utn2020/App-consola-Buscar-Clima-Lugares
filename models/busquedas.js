const fs = require ('fs');
const axios = require('axios')


class Busquedas {

    historial = [];
    dbPath = './db/database.json';

    constructor(){
        //todo: leer DB;
        this.leerDB();
    }

    get historialCapitalizado(){
        
        return this.historial.map( lugar => {
            let palabra = lugar.split( ' ' );
            palabra = palabra.map( p => p[0].toUpperCase() + p.substring(1) );

            return palabra.join( ' ' );
        } )
        
    }

    get paramsMapBox(){
        return {
            'access_token' : process.env.MAPBOX_KEY,
            'limit': 5,
            'language':'es'
        }
    }

    get paramsOpenWeather(){
        return {
            'appid': process.env.OPENWEATHER,
            'units': 'metric',
            'lang' : 'es'
        }
    }

    async ciudad( lugar = ''){

        try{
            //petición http
            const instace = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${lugar}.json`,
                params: this.paramsMapBox    
                
            })
            

            const resp = await instace.get();
            return resp.data.features.map( lugar =>({
                id: lugar.id,
                nombre: lugar.place_name,
                lng: lugar.center[0],
                lat: lugar.center[1]
            }))

        }catch( err ){
            console.log('error');
            return [];
        }
    }


    async climaLugar( lat, lon){
        try {

            const instance = axios.create({
                baseURL : `https://api.openweathermap.org/data/2.5/weather`,
                params: {...this.paramsOpenWeather, lat, lon}
            })

            
            const resp = await instance.get();
            const {temp, temp_min, temp_max} = resp.data.main;
            const {description} = resp.data.weather[0];
            
            
            return {
                description,
                temp,
                temp_max,
                temp_min
            };
            
        } catch (error) {
            console.log('error');
        }
    }

    agregarHistorial( lugar = '' ){

        if(this.historial.includes( lugar.toLocaleLowerCase() )){
            return;
        }

        this.historial = this.historial.splice(0,5);

        this.historial.unshift(lugar.toLocaleLowerCase() );

        //gabar en Db
        this.guardarDB();
    }
    
    guardarDB(){

        const payload = {
            historial: this.historial
        }

        fs.writeFileSync(this.dbPath, JSON.stringify(payload));
    }

    leerDB(){

        if(!fs.existsSync(this.dbPath)){
            return null;
        }
        const info = fs.readFileSync( this.dbPath, {encoding: 'utf-8'} );
        const data = JSON.parse( info );
        const { historial } = data;

        this.historial = [...historial];
    }
}

module.exports = Busquedas;