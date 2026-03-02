$('.toggle-tickets').click(function() {
  $tickets = $(this).parent().siblings('.collapse');
 
  if ($tickets.hasClass('in')) {
    $tickets.collapse('hide');
    $(this).html('Show Tickets');
    $(this).closest('.ticket-card').removeClass('active');
  } else {
    $tickets.collapse('show');
    $(this).html('Hide Tickets');
    $(this).closest('.ticket-card').addClass('active');
  }
});