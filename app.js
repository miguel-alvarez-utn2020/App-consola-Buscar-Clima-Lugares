require('dotenv').config()


const { leerInput, inquirerMenu, pausa, listadoLugares } = require('./helpers/inquirer');
const Busquedas = require('./models/busquedas');



const main = async() => {
    
    const busqueda = new Busquedas();
    let opt;

    
    do{
        opt = await inquirerMenu();
        switch(opt){
            
            case 1:
                // Mostrar mensaje
                const terminoBusqueda = await leerInput('Elige Lugar');
                //Buscar los lugares
                const lugares = await busqueda.ciudad( terminoBusqueda );
                
                //Seleccionar el lugar
                const idSeleccionado = await listadoLugares(lugares);
                const lugarSeleccionado = lugares.find( lugar => lugar.id === idSeleccionado );
                const { nombre, lat, lng } = lugarSeleccionado;
                if(idSeleccionado === '0') continue;
                //guardar DB
                busqueda.agregarHistorial( nombre );
                //clima del lugar
                const clima = await busqueda.climaLugar(lat, lng);
                const {description, temp, temp_max, temp_min} = clima;

                //mostrar resultados
                console.clear();
                console.log('\nInformación de del lugar\n'.green);
                console.log('Ciudad: ', nombre);
                console.log('Lat: ', lat);
                console.log('Lng:', lng);
                console.log('Como está el clima: ', description);
                console.log('Temperatura: ', temp);
                console.log('Mínima: ', temp_min);
                console.log('Máxima: ', temp_max);
                break;
            case 2:
                console.log('Historial...');
                    busqueda.historialCapitalizado.forEach( (lugar, i) => {
                        const idx = `${i + 1}.`
                        console.log(`${idx} ${lugar}`);
                    })
                break;
            case 0:
                console.log('Saliendo de la app');
                break;
        }
        
        await pausa();
    }while(opt !== 0);

}

main();