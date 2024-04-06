$(document).ready(function() {
  $('#downloadPDF').click(function(e){
    e.preventDefault();
    
    let count = $('#salesCount').text();
    let money = $('#salesMoney').text();
    
    alert('download pdf')
    const doc = new window.jspdf.jsPDF();
    
    doc.text(`Total sales count:${count}`,10,10);
    doc.text(`Total revenue :${money}`,10,20);
    doc.autoTable({
      startY:40,
      html: '#myTable' 
    });
    doc.save('table.pdf');
  });
  $('#downloadCSV').click(function(e){
    e.preventDefault();
    alert('download csv')
    const table = document.getElementById('myTable');
    const rows = table.querySelectorAll('tr');
    const csv = [...rows].map(row => [...row.querySelectorAll('td,th')].map(cell => cell.textContent.trim()).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'table.csv';
    link.click();
  });
});