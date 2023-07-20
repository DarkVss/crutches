<?php 

function getURLHttpCode(string $url) : ?int {
    $headers = get_headers($url, true, stream_context_create([
        "ssl"  => [
            "verify_peer"      => false,
            "verify_peer_name" => false,
        ],
        "http" => [
            "method"          => "GET",
            "follow_location" => 0,
            "header"          => "User-Agent: Mozilla/5.0 (compatible; YandexBot/3.0; +http://yandex.com/bots)\r\n",
        ],
    ])) ?: [];

    return ((int) (explode(" ", $headers[0] ?? '')[1] ?? 0)) ?: null;
}

$url = "https://some.domain/news"; // "https://some.domain/news" > "https://some.domain/news/page/2" > ... > "https://some.domain/news/page/N"

$getLastPageNumber = function(int $pageNumber,bool $previouslyIsRedirect,bool $isFinalSearch = false)use(&$getLastPageNumber, $url):int{
    $newPageNumber = $pageNumber + ($isFinalSearch === false ? 25 : ($previouslyIsRedirect === true ? -5 : 1));
    if($newPageNumber === 0){
        $pageNumber = 1;
        $newPageNumber = 2;
        $previouslyIsRedirect = false;
    }

    $code = getURLHttpCode("{$url}/page/{$newPageNumber}");

    if($code === 301){
        if($isFinalSearch === true && $previouslyIsRedirect === false){
            return $pageNumber;
        }
        return $getLastPageNumber($newPageNumber,true,true);
    }else{
        return $getLastPageNumber($newPageNumber,false,$isFinalSearch);
    }
};


$lastPageNumber = $getLastPageNumber(0, false,false);
