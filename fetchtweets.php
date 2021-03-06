<?
error_reporting(E_ALL);
ini_set('display_errors', '1');
//We use already made Twitter OAuth library
//https://github.com/mynetx/codebird-php
require_once ('codebird.php');

//Twitter OAuth Settings, enter your settings here:
$CONSUMER_KEY = 'p';
$CONSUMER_SECRET = 'd';
$ACCESS_TOKEN = '3';
$ACCESS_TOKEN_SECRET = 'O';

//Get authenticated
Codebird::setConsumerKey($CONSUMER_KEY, $CONSUMER_SECRET);
$cb = Codebird::getInstance();
$cb->setToken($ACCESS_TOKEN, $ACCESS_TOKEN_SECRET);


if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $q = $_POST['q'];
  $count = $_POST['count'];
  $api = $_POST['api'];
}else{
  $q = $_GET['q'];
  $count = $_GET['count'];
  $api = $_GET['api'];
}


//https://dev.twitter.com/docs/api/1.1/get/statuses/user_timeline
//https://dev.twitter.com/docs/api/1.1/get/search/tweets
$params = array(
	'screen_name' => $q,
	'q' => $q,
	'count' => $count
);

//Make the REST call
$data = (array) $cb->$api($params);

//Output result in JSON, getting it ready for jQuery to process
echo json_encode($data);

?>