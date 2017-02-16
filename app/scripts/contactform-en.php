<?php

date_default_timezone_set('Europe/Berlin');

$emailTo = 'og@olafgleba.de';
$emailFrom = 'webmaster@olafgleba.de';
$emailSubject = "Ideal Standard International | ISH Microsite | Contact form";

if(isset($_POST['submitform'])) {

  // Check on honeypot
  if(empty($_POST['fullname']) || $_POST['fullname'] == '') {

    $message  = '';
    $message .= "On ".date('d/m/Y')." ";
    $message .= $_POST['name']." has sent us a message:\n\n";
    $message .= "Data:\n";
    $message .= "Name: ".$_POST['name']."\n";
    $message .= "E-Mail: ".$_POST['email']."\n";
    $message .= "Company: ".$_POST['company']."\n\n";
    $message .= "Message:\n";
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
