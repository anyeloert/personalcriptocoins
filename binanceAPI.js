
const obtenerDatos = async () => {
    const URL  = `https://api.binance.com/api/v3/exchangeInfo`
    const data =await axios.get(URL)
    const {symbols} = data.data
    return symbols
}
// Extrae todos los pares de intercambio de la exchange

buscarData = async (symbol) =>  await axios.get(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1d&limit=1000`)
// extraer informacion de un par de intercambio 
const informa = () => {
    const table = document.getElementById('tabla')
    const tbody = document.getElementById('tbodyporcentaje')
    table.removeChild(tbody)
    const tbody1 = document.createElement('tbody')
    tbody1.setAttribute('id', 'tbodyporcentaje')
    table.appendChild(tbody1)
    obtenerDatos().then(res =>{
        res.map ((parproper, index) => {
            let limit = 38
            const {symbol, status, baseAsset, quoteAsset} = parproper
            const par = `${baseAsset}/${quoteAsset}`
            if (status === 'TRADING' && (quoteAsset === 'USDT' || quoteAsset === 'BTC')){
                buscarData(symbol).then(res => {
                    let {data} = res  // se obtienen el arreglo data con destructuring que contiene 
                    //la informacion de las velas
                    res = arraySimple (data,4 ) //array con solo los datos de los precio de cierre de 
                    //cada vela; en binance el precie de cierre de encuentra en el indice 4
                
                    let mayor = calcularTodasCombi(res,limit)
                    while (mayor.mayor > limit/2) {
                    mayor =   calcularTodasCombi(res, mayor.mayor*2);
                    limit = mayor.mayor*2
                    }
                    console.log(mayor);
                    if (mayor.porcentaje >= 100)
                        agregarFila(par, mayor);
                })
             } 
        })      
    })
}

// calcula la combinacion de medias que ha generado la mayor ganancia por par de intercambio, y la muestra en la tabla html

const tomarFilas = () => {
    const table = document.getElementById('tablaResumen')
    const tbody = document.getElementById('tbodyResumen')
    table.removeChild(tbody)
    const tbody1 = document.createElement('tbody')
    tbody1.setAttribute('id', 'tbodyResumen')
    table.appendChild(tbody1)
    const filas = document.getElementById('tabla').getElementsByTagName('tr')
    console.log(filas);
    Array.prototype.forEach.call(filas, (par, index) => {
        let Par, mediaMenor, mediaMediana, mediaMayor, porcentaje, diasRacha
        if (index > 0){
            Array.prototype.forEach.call(par.cells, (columna, index) => {
                if (index === 0){
                    Par = columna.innerText.replace("/","")
                }
                if (index === 1){
                    mediaMenor = columna.innerText
                }
                if (index === 2){
                    mediaMediana = columna.innerText
                }
                if (index === 3){
                    mediaMayor = columna.innerText
                }
                if (index === 4){
                    porcentaje = columna.innerText
                }
            })
            buscarData(Par).then(res => {
                let {data} = res 
                res = arraySimple(data, 4)
                diasRacha = diasCumpliendoCondicion(res, mediaMenor, mediaMediana, mediaMayor)
                if (diasRacha === 2){
                    agregarFila2(Par, mediaMenor, mediaMediana, mediaMayor, porcentaje, diasRacha)
                }
            })
            
        }
    });    
}

agregarFila2 = (par, mediaMenor, mediaMediana, mediaMayor, porcentaje, diasRacha) => {
    const tr = document.createElement('tr')
    const tbody = document.getElementById('tbodyResumen')
    let td1 = document.createElement('td')
    let td2 = document.createElement('td')
    let td3 = document.createElement('td')
    let td4 = document.createElement('td')
    let td5 = document.createElement('td')
    let td6= document.createElement('td')
    td1.innerHTML = par
    td2.innerHTML = mediaMenor
    td3.innerHTML = mediaMediana
    td4.innerHTML = mediaMayor
    td5.innerHTML = porcentaje
    td6.innerHTML = diasRacha
    tr.appendChild(td1)
    tr.appendChild(td2)
    tr.appendChild(td3)
    tr.appendChild(td4)
    tr.appendChild(td5)
    tr.appendChild(td6)
    tbody.appendChild(tr)
    
} // agrega la informacion del objeto 'mayor' en una fila de la tabla 'tabla'

const diasCumpliendoCondicion = (velas, mediaMenor, mediaMediana, mediaMayor) => {
    let bool = false
    let valorMediaMenor, valorMediaMediana, valorMediaMayor, valorMediaMenorAnterior = 0
    let n = 0, diasRacha = 0
    let velasInversa = velas.reverse()
    valorMediaMenor = mediaSimpleInversa(velasInversa, mediaMenor, n)
    valorMediaMediana = mediaSimpleInversa(velasInversa, mediaMediana, n)
    valorMediaMayor = mediaSimpleInversa(velasInversa, mediaMayor, n)
    valorMediaMenorAnterior = mediaSimpleInversa(velasInversa, mediaMenor, n + 1)
    if (valorMediaMayor < valorMediaMediana && valorMediaMediana < valorMediaMenor && valorMediaMenorAnterior < valorMediaMenor){
        bool = true
        diasRacha += 1
    }
    while (bool === true){
        n += 1
        valorMediaMenor = mediaSimpleInversa(velas, mediaMenor, n)
        valorMediaMediana = mediaSimpleInversa(velasInversa, mediaMediana, n)
        valorMediaMayor = mediaSimpleInversa(velasInversa, mediaMayor, n)
        valorMediaMenorAnterior = mediaSimpleInversa(velasInversa, mediaMenor, n + 1)
        if (valorMediaMayor < valorMediaMediana && valorMediaMediana < valorMediaMenor && valorMediaMenorAnterior < valorMediaMenor){
            diasRacha += 1
        }else {
            bool = false
        }
    }   
    return diasRacha;
}



const shortButton = document.getElementById('short');
shortButton.addEventListener('click', tomarFilas)

//Accion del boton Long

const longButton = document.getElementById('long');
longButton.addEventListener('click', informa)

//Accion del boton Short


agregarFila = (par, mayor) => {
    const tbody = document.getElementById('tbodyporcentaje')
    const tr = document.createElement('tr')
    let td = document.createElement('td')
    td.innerHTML = par
    console.log(par);
    tr.appendChild(td)
    tbody.appendChild(tr)
    for(const prop in mayor){
        let td1 = document.createElement('td')
        td1.innerHTML = mayor[prop]
        tr.appendChild(td1)
    }    
    tbody.appendChild(tr)
    
} // agrega la informacion del objeto 'mayor' en una fila de la tabla 'tabla'






arraySimple = (array, indice) => {
    array = array.map(obj => obj[indice]) // recorre el array y sustituye cada objeto 
    //con el precio de cierre
    return array
}
//devuelve un array solo con los precios de cierre de cada vela
// parametros= array: array que va a recorrer para buscar los precios de cierre
//             indice: indice del array donde se encuentra el precio de cieere

mediaSimple = (array, periodo, _indice) => {
    let media=0
    for (i=_indice;i>=_indice - periodo + 1; i--){
        let  ind = array[i]
        media += parseFloat(ind)
    }    
    return media/periodo
}
//devuelve la media en una vela especifica senalada por el indice,
//parametros = array: array deonde se encuentra la vela de donde se calculara la media
//             periodo: es el periodo de la media
//             _indice: es el indice del array donde se encuentra la vela donde se 
// calculara la media 

mediaSimpleInversa = (array, periodo, _indice) => {
    let media=0
    for (i=_indice;i<=_indice + (periodo - 1); i++){
        let  ind = array[i]
        //console.log(array[i]);
        media += parseFloat(ind)
    }    
    return media/periodo
}
//devuelve la media en una vela especifica senalada por el indice,
//parametros = array: array deonde se encuentra la vela de donde se calculara la media
//             periodo: es el periodo de la media
//             _indice: es el indice del array donde se encuentra la vela donde se 
// calculara la media 

mediaTodoArrayInverso = (array, periodo, _indice, media) =>{
        
        if (_indice === 0){
            media = mediaSimple(array, periodo, _indice)
        }else if (_indice > 0){
            media = media + array[_indice + periodo]/periodo - array[_indice - 1]/periodo
        }else if (_indice > array.lenght - periodo) {
            media = 0
        }
    return media
}

mediaTodoArray = (array, periodo, _indice, media) =>{
        
        if (_indice == periodo - 1){
            media = mediaSimple(array, periodo, _indice)
        }else if (_indice > periodo - 1){
            media = media - array[_indice-periodo]/periodo + array[_indice]/periodo
        }else {media = 0}
    return media
}
//Calcula la media en un indice especifico, si es la primera media que se calcula del arreglo usara la funcion 'mediaSimple' despues restara el valor del indice anterior
// y le sumara el valor del proximo indice

recorrerArray = (array,  perMay, perMed, perMen) => {
    let mediaMenAnt, mediaMay, mediaMed, mediaMen, precioCompra, porcentaje = 0
    let comprar = false
    
    array.forEach((_element, index) =>{
        mediaMenAnt = mediaMen
        mediaMay = mediaTodoArray(array, perMay, index, mediaMay)
        mediaMed = mediaTodoArray(array, perMed, index, mediaMed)
        mediaMen = mediaTodoArray(array, perMen, index, mediaMen)
        if (index + 1 >= perMay){
            if (comprar == false && mediaMen > mediaMed && mediaMed > mediaMay && mediaMenAnt < mediaMen){
                comprar = true
                precioCompra = parseFloat(array[index])
            }else if (comprar &&  (mediaMen < mediaMed || mediaMed < mediaMay || mediaMenAnt > mediaMen)) {
                comprar = false
                porcentaje +=  parseFloat((array[index] - precioCompra)*100/precioCompra)
            }
        }
    });
    return porcentaje;      
}

// Recorre todo el array de precios calcula las medias con los periodos ingresados los compara y devuelve el porcentaje total de ganancia con esas tres medias

calcularTodasCombi = (array, limiCom) => {
    let mayor = {
        menor : 0,
        mediana : 0,
        mayor : 0,
        porcentaje : 0
    }
    let porcentajeMayor = 0
    let s = 0
    let porcentaje 
    for (let i = 1 ; i < limiCom - 1 ; i++){
        for (let j = i + 1 ; j < limiCom ; j++){
            for (let k = j + 1 ; k <= limiCom ; k++){
                porcentaje = recorrerArray(array, k, j, i)
                if (porcentaje >= porcentajeMayor){
                    porcentajeMayor = porcentaje
                    mayor ={
                        menor : i,
                        mediana : j,
                        mayor : k,
                        porcentaje : porcentajeMayor
                    }  
                }
            }
        }
    }
    return mayor
}

//calcula el porcentaje de ganancia para las distintas combinaciones de medias 



