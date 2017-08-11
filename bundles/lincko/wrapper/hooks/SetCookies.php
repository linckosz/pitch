<?php

namespace bundles\lincko\wrapper\hooks;

use \libs\Vanquish;

function SetCookies(){
	Vanquish::setCookies();
}
