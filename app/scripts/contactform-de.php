<?php

date_default_timezone_set('Europe/Berlin');

$emailTo = 'og@olafgleba.de';
$emailFrom = 'webmaster@olafgleba.de';
$emailSubject = "Ideal Standard International | ISH Microsite | Contact form";

if(isset($_POST['submitform'])) {

  // Check on honeypot
  if(empty($_POST['fullname']) || $_POST['fullname'] == '') {

    $message  = '';
    $message .= "Am ".date('d/m/Y')." ";
    $message .= "hat ".$_POST['name']." uns eine Nachricht gesendet:\n\n";
    $message .= "Angaben:\n";
    $message .= "Name: ".$_POST['name']."\n";
    $message .= "E-Mail: ".$_POST['email']."\n";
    $message .= "Firma: ".$_POST['company']."\n\n";
    $message .= "Nachricht:\n";
    $message .= $_POST['mesg'];

    $header  = '';
    $header .= "Reply-to: ".$_POST['email']. "\r\n";
    $header .= "From: ".$emailFrom. "\r\n";
    $header .= "X-Mailer: PHP/" . phpversion();

    mail($emailTo, $emailSubject, $message, $header);

    $_POST[] = '';
  }
}
?>
