/*  Esta 'CALCULADORA' es una herramienta para gestionar aumentos de sueldo.
    Te dice cuánto tienes que subir para que no pierdas poder adquisitivo con el cambio.
    Para ello, se basa en el IRPF actual y en el que se aplicará a partir de
    la subida de sueldo.
    El IRPF se calcula según la siguiente tabla:
        Hasta 12.450€...........19%
        De 12.450€ a 20.200€....24%
        De 20.200€ a 35.200€....30%
        De 35.200€ a 60.000€....37%
        De 60.000€ a 300.000€...45%
        Más de 300.000€.........47%

    El resultado se muestra en la consola 

    Si tienes alguna duda, puedes contactar conmigo en:
    https://www.linkedin.com/in/juliocabanillas42/  */

let index           = 0,
    /** Array con los tramos impositivos */
    TRAMOS          = [12450, 20200, 35200, 60000, 300000],
    /** Array con los tipos impositivos */
    IRPF            = [0.19 ,0.24 ,0.3 ,0.37 ,0.45, 0.47],
    subida		    = 0,
    perdidas        = [{}],
    netoAhora,
    netoDespues,
    minimoRentable  = [];

if ((TRAMOS.length+1)==IRPF.length) {
    let noJump;
    while (index<IRPF.length) {
        noJump = false;
        netoAhora   = TRAMOS[index] - getTaxes(TRAMOS[index]);
        netoDespues = TRAMOS[index] + subida - getTaxes(TRAMOS[index] + subida);
        noJump = (netoAhora >= netoDespues);
        if (noJump) {
            perdidas.push({tramo: TRAMOS[index], subidaMinRentable: subida});
        };
        if ((TRAMOS[index]+subida)>=TRAMOS[index+1]
            || !noJump) {
            index++;
            subida=0;
        };
        /* Me gustan los números "redondos" */
        subida+=5;
    };
    /* Nos quedamos sólo con la mayor pérdida para cada tramo: */
    perdidas = perdidas.filter((item, index, array) => {
        return array.findIndex((item2) => {
            return (item2.tramo == item.tramo && item2.subidaMinRentable > item.subidaMinRentable);
        }) == -1;
    });
    perdidas.shift();
    for (let i = 0; i < perdidas.length; i++) {
        let tramito = perdidas[i].tramo;
        if (i < perdidas.length-1) {
            tramito+=" a "+perdidas[i+1].tramo;
        } else {
            if (perdidas[i].tramo < TRAMOS[TRAMOS.length-1]) {
                tramito+=" a "+TRAMOS[TRAMOS.length-1];
            } else {
                tramito+=" en adelante";
            };
        };
        minimoRentable[i] = {
            tramo: tramito,
            rentable_desde: perdidas[i].tramo+perdidas[i].subidaMinRentable
        };
    };
    console.log('Los respectivos mínimos rentables para cada tramo son: ', minimoRentable);
} else {
    console.log("No coinciden los arrays de tramos e IRPF :^(");
};

/** Genera código según la longitud del TRAMO impositivo    :^) */
function getTaxes(sueldo) {
    let code = `function getSomeCode(sueldo) {
        let a; `;
    code += `if (sueldo <= ${TRAMOS[0]}) {`+
        `   a = 0; `+
        `}`;
    TRAMOS.length>1? code+=` else `: null;
    for (let i = 0; i <= TRAMOS.length-1; i++) {
        if (i<=(TRAMOS.length-2)) {
            code += `if (sueldo > ${TRAMOS[i]}  && sueldo <= ${TRAMOS[i+1]}) {
                a = ${i+1};
            } else `;
        } else {
            code += ` {
                a = ${i+1};
            }; `;
        };
    };
    code += ` 
        return IRPF[a]*sueldo; };`;
    code += `
    getSomeCode(${sueldo});`;
    return eval(code);
};