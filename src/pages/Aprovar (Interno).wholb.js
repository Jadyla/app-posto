// API Reference: https://www.wix.com/velo/reference/api-overview/introduction
// “Hello, World!” Example: https://learn-code.wix.com/en/article/1-hello-world
import wixWindow from 'wix-window';

import {
    utils_fmt_date,
    utils_config_items,
    utils_fmt_money_with_prefix,
    TRANSACAO_PENDENTE,
} from "public/utils";

import {
    be_mod_utils_get_pending_transactions,
} from "backend/be_mod_utils";


let g_transacoes_pendentes = [
    {ui: "#textClientName", type: "text", db: "client_name"},
    {ui: "#textCodBomba", type: "text", db: "cod_bomba", format: fmt_cod_bomba},
    {ui: "#textData", type: "text", db: "data", format: utils_fmt_date},
    {ui: "#textValorAPagar", type: "text", db: "valor_a_pagar", format: fmt_valor_a_pagar},
    {ui: "#buttonDetalhes", type: "button", onClick: onclick_ver_detalhes},
];


function fmt_cod_bomba(val) {
    return "Cod. Bomba: " + val;
}

function fmt_valor_a_pagar(val) {
    return "Valor a pagar: " + utils_fmt_money_with_prefix(val);
}

async function onclick_ver_detalhes() {
    wixWindow.openLightbox("Janela Aprovar (interno)");
}

async function load_pending_transactions() {
    $w("#repeaterTransacoesPendentes").onItemReady( ($item, itemData, index) => {
        utils_config_items($item, g_transacoes_pendentes, itemData);
    });

    let transacoes_pendentes = await be_mod_utils_get_pending_transactions(TRANSACAO_PENDENTE);

    $w("#repeaterTransacoesPendentes").data = transacoes_pendentes;
}

$w.onReady(function () {
    load_pending_transactions();
    // Write your JavaScript here

    // To select an element by ID use: $w('#elementID')

    // Click 'Preview' to run your code
});
