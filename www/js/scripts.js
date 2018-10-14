//http://www.javascriptlint.com/online_lint.php
var db;
var dbCreated = false;
var codigo = 0;
var data;
var produto;
var quantidade;
var valor;
var prevSelection = "tab1";
//document.addEventListener("deviceready", onDeviceReady, false);
try {
	db = window.openDatabase("VendasDB", "1.0", "PhoneGap Demo", 200000);
	db.transaction(populateDB, transaction_error, populateDB_success);
} catch(e) {
	alert('Error');
	alert(JSON.stringify(e));
}

function pad(s) { 
	return (s < 10) ? '0' + s : s; 
}

function isNumberKey(evt) {
	var charCode = (evt.which) ? evt.which : event.keyCode;
	if (charCode > 31 && (charCode < 48 || charCode > 57)){
		return false;
	} else {	
		return true;
	}
}

function PaginaAtual(pagina){
	//Inserir Vendas
	if (pagina =="tab2"){
		$('#data_venda').val('');
		$('#quantidade').val('');
		$('#valor').val('');
		$("#produto").val($("#produto option:first").val());
	}
	
	//Listar Vendas
	if (pagina =="tab3"){
		db.transaction(listarVendas, transaction_error, transaction_sucess);
	}
	//Resumo
	if (pagina =="tab4"){
		db.transaction(Resumo, transaction_error, transaction_sucess);
		db.transaction(SinteticoPorProduto, transaction_error, transaction_sucess);
		db.transaction(SinteticoPorData, transaction_error, transaction_sucess);
	}
}

function onDeviceReady() {
	try {
		db = window.openDatabase("VendasDB", "1.0", "PhoneGap Demo", 200000);
		db.transaction(populateDB, transaction_error, populateDB_success);
	} catch(e) {
		alert('Error');
		alert(JSON.stringify(e));
	}
	
}


function transaction_error(tx, error) {
    alert("Erro no banco de dados: " + error);
}

function transaction_sucess(tx, name) {
    //Nada a fazer
}

function populateDB_success() {
	dbCreated = true;
}

function populateDB(tx) {
	//Desativar em producao
	//tx.executeSql('DROP TABLE IF EXISTS vendas');
	var sql = 
		"CREATE TABLE IF NOT EXISTS vendas ( "+
		"id INTEGER PRIMARY KEY AUTOINCREMENT, " +
		"data VARCHAR(50), " +
		"produto VARCHAR(50), " +
		"quantidade INTEGER, " +
		"valor INTEGER " +
		")";
    tx.executeSql(sql);
}

//Listar Vendas

function listarVendas(tx) {
	var sql = "select * from vendas order by id";
	tx.executeSql(sql, [], listarVendas_success);
}

function listarVendas_success(tx, results) {
	$('#analitico > tbody').html('');
	if (typeof results == "undefined") {
		var html ='<tr><td colspan=5>Nao existem informacoes</td></tr>';
		$("#analitico > tbody").append(html);
	} else {
		var len = results.rows.length;
		if (len==0){
			var html ='<tr><td colspan="5" align="center">Nao existem informacoes</td></tr>';
			$("#analitico > tbody").append(html);
		}
		for (var i=0; i<len; i++) {
			var venda = results.rows.item(i);
			
			var tmp_data;
			var d = new Date(venda.data);
			var tmp_data = [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('/');
			
			html ='<tr><td>' + tmp_data + '</td>' +
				  '<td>' + venda.produto + '</td>' +
				  '<td align="center">' + venda.quantidade + '</td>' +
				  '<td align="center">' + venda.valor  + '</td>' +
				  '<td align="center"><a href="#" onclick="excluirVenda(' + venda.id + ');"  data-role="button" data-icon="delete" data-iconpos="notext" >Excluir</a></td>' +
				  
				  '</tr>';
			$("#analitico > tbody").append(html);
		}
	}
	$("#analitico").trigger('create');
	//db = null;
}

//Inserir Vendas
function InserirVenda(tx) {
	tx.executeSql("INSERT INTO vendas (data,produto,quantidade,valor) VALUES ('" + data+ "','" + produto + "','" + quantidade + "','" + valor + "')");
}

function InserirVenda_success(tx, results) {
    var newSelection = "tab3";
    $("."+prevSelection).addClass("ui-screen-hidden");
    $("."+newSelection).removeClass("ui-screen-hidden");
	
	$(".btn2").removeClass("ui-btn-active");
	$(".btn3").addClass("ui-btn-active");
	
    prevSelection = newSelection;
	PaginaAtual(newSelection);
}

//Excluir Vendas
function excluirVenda(id_venda){
	codigo = id_venda;
	db.transaction(ExcluirVendas, transaction_error, excluirVendas_success);
	
}

function ExcluirVendas(tx) {
	var sql = "delete from vendas where id = " +codigo;
	tx.executeSql(sql, [], excluirVendas_success);
	
}

function excluirVendas_success(tx, results) {
	//alert('Venda excluida com sucesso!');
	//Recarregar a pagina
	PaginaAtual("tab3")
}

//Resumo das Vendas
function Resumo(tx) {
	var sql = "select sum(quantidade) as quantidade, sum(valor) as valor from vendas";
	tx.executeSql(sql, [], Resumo_success);
}

function Resumo_success(tx, results) {
	$('#tabela_resumo > tbody').html('');
	if (typeof results == "undefined") {
		var html ='<tr><td colspan="2" align="center">Nao existem informacoes</td></tr>';
		$("#tabela_resumo > tbody").append(html);
	} else {
		var len = results.rows.length;
		if (len==0){
		var html ='<tr><td colspan="2" align="center">Nao existem informacoes</td></tr>';
			$("#tabela_resumo > tbody").append(html);
		}
		var contador = 0;
		for (var i=0; i<len; i++) {
			var venda = results.rows.item(i);
			if (venda.quantidade != null){
			contador++;
			var html ='<tr>' +
		      '<td align="center">' + venda.quantidade + '</td>' +
			  '<td align="center">R$ ' + venda.valor  + '</td>' +
			  '</tr>';
			$("#tabela_resumo > tbody").append(html);
			}
		}
		if (contador==0){
		var html ='<tr><td colspan="2" align="center">Nao existem informacoes</td></tr>';
			$("#tabela_resumo > tbody").append(html);
		}
	}
	//$("#tabela_resumo").table().table("refresh");  
	$("#tabela_resumo").trigger('create');
	//db = null;
}


//Resumo Sintetico das Vendas
function SinteticoPorProduto(tx) {
	var sql = "select produto, sum(quantidade) as quantidade, sum(valor) as valor from vendas group by produto order by sum(quantidade)";
	tx.executeSql(sql, [], SinteticoPorProduto_success);
}

function SinteticoPorProduto_success(tx, results) {
	$('#tabela_produto > tbody').html('');
	if (typeof results == "undefined") {
		var html ='<tr><td colspan="3" align="center">Nao existem informacoes</td></tr>';
		$("#tabela_produto > tbody").append(html);
	} else {	
    var len = results.rows.length;
	if (len==0){
		var html ='<tr><td colspan="3" align="center">Nao existem informacoes</td></tr>';
		$("#tabela_produto > tbody").append(html);
	}
	for (var i=0; i<len; i++) {
    	var venda = results.rows.item(i);
		var html ='<tr><td>' + venda.produto + '</td>' +
		      '<td align="center">' + venda.quantidade + '</td>' +
			  '<td align="center">R$ ' + venda.valor  + '</td>' +
			  '</tr>';
		$("#tabela_produto > tbody").append(html);
    }
	}
	//$("#tabela_produto").table().table("refresh");  
	$("#tabela_produto").trigger('create');
	//db = null;
}

function SinteticoPorData(tx) {
	var sql = "select data, sum(quantidade) as quantidade, sum(valor) as valor from vendas group by produto order by data";
	tx.executeSql(sql, [], SinteticoPorData_success);
}

function SinteticoPorData_success(tx, results) {
	$('#tabela_data > tbody').html('');
	if (typeof results == "undefined") {
		var html ='<tr><td colspan="3" align="center">Nao existem informacoes</td></tr>';
		$("#tabela_data > tbody").append(html);
	} else {	
		var len = results.rows.length;
		if (len==0){
			var html ='<tr><td colspan="3" align="center">Nao existem informacoes</td></tr>';
			$("#tabela_data > tbody").append(html);
		}
		for (var i=0; i<len; i++) {
			var venda = results.rows.item(i);
			var tmp_data;
			var d = new Date(venda.data);
			var tmp_data = [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('/');
			var html ='<tr><td>' + tmp_data + '</td>' +
				  '<td align="center">' + venda.quantidade + '</td>' +
				  '<td align="center">R$ ' + venda.valor  + '</td>' +
				  '</tr>';
			$("#tabela_data > tbody").append(html);
		}
	}
	//$("#tabela_data").table().table("refresh"); 
	$("#tabela_data").trigger('create');

	//db = null;
}

//Tela de inserir vendas
$(document).on('pageinit', '#main', function(){
$(document).on('click', '#enviar_venda', function() { // catch the form's submit event
			
	var continuar = true;
	var mensagem ="Ocorreram os seguintes erros:\n";
				
	if ($('#data_venda').val() == "") {
		mensagem = mensagem +  'Digite a data da venda\n';
		continuar = false;
	} 
	
	if ($('#quantidade').val() == "") {
		mensagem = mensagem +  'Informe a quantidade\n';
		continuar = false;
	} else {
		if ($('#quantidade').val() == "0") {
			mensagem = mensagem +  'A quantidade não pode ser zero\n';
			continuar = false;
		} 
		
	}
	
	if ($('#valor').val() == "") {
		mensagem = mensagem +  'Informe o valor\n';
		continuar = false;
	} else {
		if ($('#valor').val() == "0") {
			mensagem = mensagem +  'O valor não pode ser zero\n';
			continuar = false;
		} 
	}
	
	if (continuar){
		//Ir para listagem de vendas
		data = $('#data_venda').val();
		produto = $('#produto').val();
		quantidade = $('#quantidade').val();
		valor = $('#valor').val();
		db.transaction(InserirVenda, transaction_error, InserirVenda_success);
		
	} else {
		alert(mensagem);
		//navigator.notification.alert(mensagem, alertDismissed, 'Rastreio Mobile', 'OK');
	}
	return false; // cancel original event to prevent form submitting
		 
});
});