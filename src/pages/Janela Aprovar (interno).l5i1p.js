// API Reference: https://www.wix.com/velo/reference/api-overview/introduction
// “Hello, World!” Example: https://learn-code.wix.com/en/article/1-hello-world
import wixWindowFrontend from 'wix-window-frontend';
import wixWindow from 'wix-window';

import {
    utils_config_items,
    utils_fmt_date,
    utils_fmt_money_with_prefix,
    TRANSACAO_APROVADA,
    TRANSACAO_RECUSADA,
} from "public/utils";

let receivedData = wixWindowFrontend.lightbox.getContext();

let g_detalhes_transacao = [
    {ui: "#inputName", db: "nome", type:"value"},
    {ui: "#inputTipoCombustivel", db: "tipo_combustivel", type: "value"},
    {ui: "#inputCodBomba", db: "cod_bomba", type: "value"},
    {ui: "#inputDate", db: "data", type: "value", format: utils_fmt_date},
    {ui: "#inputHour", db: "data", type: "value", format: fmt_hour},
    {ui: "#inputTotal", db: "valor", type: "value", format: utils_fmt_money_with_prefix},
    {ui: "#inputIsCashback", db: "is_cashback", type: "value", format: fmt_is_cashback},
    {ui: "#inputSaldoUsed", db: "saldo_usado", type: "value", format: fmt_saldo_usado},
    {ui: "#inputValorAPagar", db: "valor_a_pagar", type: "value", format: utils_fmt_money_with_prefix},
    {ui: "#buttonAprovar", type: "button", onClick: onclick_aprovar_transacao},
    {ui: "#buttonReprovar", type: "button", onClick: onclick_reprovar_transacao},
];


function fmt_hour(val) {
    let hour = val.getHours();
    let minutes = val.getMinutes();
    let seconds = val.getSeconds();

    return `${hour}:${minutes}:${seconds}`;
}

function fmt_is_cashback(val) {
    return val ? "Não" : "Sim";
}

function fmt_saldo_usado(val) {
    return val ? utils_fmt_money_with_prefix(val) : "-";
}

async function onclick_aprovar_transacao() {
    let update_transaction = {"_id": receivedData._id, "status": TRANSACAO_APROVADA};
    wixWindow.openLightbox("Mensagem aviso aprovar (interno)", update_transaction);
}

function onclick_reprovar_transacao() {
    let update_transaction = {"_id": receivedData._id, "status": TRANSACAO_RECUSADA};
    wixWindow.openLightbox("Mensagem aviso reprovar (interno)", update_transaction);
}

$w.onReady(function () {
    utils_config_items($w, g_detalhes_transacao, receivedData);
    // Write your JavaScript here

    // To select an element by ID use: $w('#elementID')

    // Click 'Preview' to run your code
});
