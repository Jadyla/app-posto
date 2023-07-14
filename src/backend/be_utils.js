import wixData from 'wix-data';

export const BD_TRANSACOES = "transacoes";
export const BD_CLIENTE = "cliente";
export const BD_POSTOS = "postos";
export const BD_BOMBAS = "bombas";

const hist_filter_transaction = ["cashback", "pagamento"];
const hist_filter_period = {"semana": 7, "quinzena": 15, "mes": 30, "trimestre": 90};


// -------------- database query functions --------------------
export async function be_utils_get_history(_filter, member_id) {
    const _filter_date = _filter["date"]
    const filter_transaction = _filter["transaction"]

    let transacoes = await wixData.query(BD_TRANSACOES)
                            .eq("clienteId", member_id)
                            .find({suppressAuth: true})
                            .then((results) => {
                                return results["items"];
                            })

    let postos = await wixData.query(BD_POSTOS)
                        .find({suppressAuth: true})
                        .then((results) => {
                            return results["items"];
                        })

    let hist = transacoes.map((transacao) => {
        let posto = postos.find(posto => posto._id === transacao.postoId);
        return {
            "_id": transacao._id,
            "data": transacao._createdDate,
            "tipo": transacao.tipo,
            "db": transacao.valorTipo,
            "nome": posto.nome,
            "total": transacao.valor
        };
    });

    if (!_filter)
        return hist;


    if (hist_filter_transaction.includes(filter_transaction)){
        hist = hist.filter((value) => value.tipo.includes(filter_transaction));
    }
    
    if (Object.keys(hist_filter_period).includes(_filter_date)){
        const now = new Date();
        let period_of_time = hist_filter_period[_filter_date];

        hist = hist.filter((value) => {
            const item_time = new Date(value.data);
            let time_diff = Math.abs((now.getTime() - item_time.getTime())/(1000*60*60*24)); // converting miliseconds to days
            if (time_diff <= period_of_time)
                return value;
        })

    }
    
    // returns [{_id, data, tipo, db, nome, total}, ...]
    return hist;
}

export async function be_utils_get_bombas_code (code_bomba) {
    let bombas = await wixData.query(BD_BOMBAS).find({suppressAuth: true})
                        .then((results) => {
                            return results["items"];
                        })
    let postos = await wixData.query(BD_POSTOS).find({suppressAuth: true})
                        .then((results) => {
                            return results["items"];
                        })

    let possible_bombas = bombas.filter(bomba => {
        return !Array.from(code_bomba).some((char, i) => {
            return char !== '-' && char !== bomba.codBomba[i];
        });
    });

    let posto_and_bomba_informations = possible_bombas.map(bomba => {
        let posto = postos.find(posto => posto._id === bomba.postoId);
        return {...bomba,
                cod_e_posto: bomba.codBomba + " - " + posto.nome,
                img_posto: posto.imgLogo ? posto.imgLogo : "",
                endereco_posto: posto.endereco ? posto.endereco : ""
            };
    });

    // returns [{_id, postoId, codBomba, cod_e_posto, img_posto, endereco_posto}]
    return posto_and_bomba_informations;
}

export async function be_utils_get_saldo(cliente_id) {
    let saldo = (await get_client_infos(cliente_id))["items"][0]["saldo"];

    return saldo;
}


// -------------- database insert functions --------------------
export async function be_utils_cadastrar_transacao(transacao) {
    wixData.insert(BD_TRANSACOES, transacao)
    .then((result) => {
        const itemInserido = result;
        console.log(itemInserido);
    })
    .catch((error) => {
        console.error(error);
    });

    update_client_saldo(transacao.clienteId, transacao.valorTipo, transacao.tipo);
}

export async function be_utils_cadastrar_cliente(cliente) {
    let cliente_on_database = await get_client_infos(cliente._id);
    if (cliente_on_database["length"])
        return cliente_on_database["items"][0];
    else{
        let cliente_db = {
            _id: cliente._id,
            nome: cliente.contactDetails.firstName + " " + cliente.contactDetails.lastName,
            email: cliente.contactDetails.email,
            saldo: 0
        }
        await wixData.insert(BD_CLIENTE, cliente_db)
        .then((result) => {
            const itemInserido = result;
            console.log(itemInserido);
        })
        .catch((error) => {
            console.error(error);
        });
    }
    
    return
}


// -------------- internal functions --------------------
async function get_client_infos(cliente_id) {
    return await wixData.query(BD_CLIENTE)
                .eq("_id", cliente_id)
                .find({suppressAuth: true})
                .then((results) => {
                    return results;
                })
}

async function update_client_saldo(cliente_id, valor_tipo, tipo) {
    const item = await wixData.get(BD_CLIENTE, cliente_id);
    item.saldo += valor_tipo;
    
    await wixData.update(BD_CLIENTE, item);
}