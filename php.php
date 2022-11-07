<?php

$xmlArray = array(
    array(
        "key" => "package",
        "_attributes_" => array(
            "login" => "login",
            "password" => "123456",
        ),
        "value" => array(
            array(
                "key" => "message",
                "value" => array(
                    array(
                        "key" => "default",
                        "_attributes_" => array(
                            "sender" => "SMSINFO"
                        ),
                    ),
                    array(
                        "key" => "msg",
                        "value" => "text",
                        "_attributes_" => array(
                            "id" => "1234",
                            "recipient" => "+79021234567",
                            "sender" => "SMSINFO",
                            "date_beg" => "2008-12-27T15:55",
                            "date_end" => "2008-12-28T15:55",
                            "type" => "0",
                        )
                    ),
                    array(
                        "key" => "msg",
                        "value" => "text",
                        "_attributes_" => array(
                            "recipient" => "+79021234567",
                        )
                    ),
                    array(
                        "key" => "items",
                        "value" => array(
                            array(
                                "key" => "item",
                                "value" => 123456789
                            ),
                            array(
                                "key" => "item",
                                "value" => 987654321
                            ),
                        )
                    )
                )
            )
        )
    )
);

echo "<h4>Input xml array</h4>";
echo "<pre>" . json_encode($xmlArray, JSON_PRETTY_PRINT + JSON_UNESCAPED_UNICODE) . "</pre><br>";

$xmlString = new DomDocument('1.0');
$xmlString->formatOutput = true;
$xmlString->loadXML(_buildXML($xmlArray));
$xmlString = $xmlString->saveXML();

echo "<h4>Output xml string</h4>";
echo "<pre>" . htmlspecialchars($xmlString) . "</pre>";

$xmlString = '<package>
  <message>
    <msg id="1234" sms_id="0" sms_count="1">201</msg>
    <msg sms_id="1234568" sms_count="1">1</msg>
  </message>
  <z>dsad</z>
</package>';

echo "<h4>Input xml string</h4>";
echo "<pre>" . htmlspecialchars($xmlString) . "</pre>";

echo "<h4>Output xml array</h4>";
echo "<pre>" . json_encode(
        _parseXML(
            simplexml_load_string($xmlString)
        ),
        JSON_PRETTY_PRINT + JSON_UNESCAPED_UNICODE
    ) . "</pre><br>";


/**
 * Build xml string from array
 * Example array and output string in begin function
 *
 * @param array   $data
 * @param integer $emptyKeysAmount
 *
 * @return string
 */
function _buildXML($data, $emptyKeysAmount = 0)
{
    $xml = "";
    foreach ($data as $datum) {
        if (isset($datum["key"])) {
            $key = (isset($datum["key"]) && !empty($datum["key"])) ? $datum["key"] : "unknown_key_" . ($emptyKeysAmount++);
            //Проверяем что рассматриваемый элемент это не набор атрибутов
            if ($key !== "_attributes_") {
                $value = isset($datum["value"]) ? $datum["value"] : "";//значение тега - либо вложенные теги(массив), либо просто значение - str,int n etc.

                $attributes = array();
                //Сбор атрибутов в массив где элемент это `аттрибут="значение_аттрибута"` - можно просто собирать строку
                if (isset($datum["_attributes_"])) {
                    foreach ($datum["_attributes_"] as $attributeKey => $attributeValue) {
                        $attributes[] =
                            "{$attributeKey}=\"" . str_replace('"', '\"', (string) $attributeValue) . "\"";
                    }
                }
                $attributes = implode(" ", $attributes);

                $xml .= "<$key $attributes" . (empty($value) ? "/" : "") . ">";

                $xml .= (is_array($value)) ?
                    _buildXML($value, $emptyKeysAmount) :
                    (string) $value;
            }

            if (!empty($value)) {
                $xml .= "</$key>";
            }
        }
    }
        
    return $xml;
}

/**
 * @param SimpleXMLElement $xmlObject
 *
 * @return array
 * @throws Exception
 */
function _parseXML($xmlObject)
{
    if (get_class($xmlObject) !== "SimpleXMLElement") {
        throw new Exception("Invalid xml");
    }

    /**
     * Обходчик для сбора информации о самом и вложеных элементов объекта SimpleXMLElement
     *
     * @param SimpleXMLElement $xmlObject
     *
     * @return array
     */
    $walker = function($xmlObject) use (&$walker) {
        $key = $xmlObject->getName();

        $attributes = array();
        foreach ($xmlObject->attributes() as $attributeKey => $attributeValue) {
            $attributes[(string) $attributeKey] = (string) $attributeValue;
        }

        $childrenKeys = array();
        $childrenValues = array();
        $children = array();
        foreach ($xmlObject->children() as $child) {
            $temp = $walker($child);

            $childrenKeys[] = $temp["key"];
            $childrenValues[] = $temp["element"];
        }

        if (count(array_unique($childrenKeys)) === count($childrenKeys)) {
            foreach ($childrenValues as $index => $childrenValue) {
                $children[$childrenKeys[$index]] = $childrenValue;
            }
        } else {
            $children = array(
                array_unique($childrenKeys)[0] => array(
                    "value" => $childrenValues,
                    "_attributes_" => null,
                    "multi" => true,
                )
            );
        }

        if (count($children) === 0) {
            $children = (string) $xmlObject;
        }

        $xmlArray = array(
            "key" => $key,
            "element" => array(
                "value" => $children,
                "_attributes_" => $attributes,
                "_multi_" => false,
            )
        );

        return $xmlArray;
    };
    $key = $xmlObject->getName();
    $multi = false;

    $attributes = array();
    foreach ($xmlObject->attributes() as $attributeKey => $attributeValue) {
        $attributes[(string) $attributeKey] = (string) $attributeValue;
    }

    $childrenKeys = array();
    $childrenValues = array();
    $children = array();
    foreach ($xmlObject->children() as $child) {
        $temp = $walker($child);

        $childrenKeys[] = $temp["key"];
        $childrenValues[] = $temp["element"];
    }
    if (count(array_unique($childrenKeys)) === count($childrenKeys)) {
        foreach ($childrenValues as $index => $childrenValue) {
            $children[$childrenKeys[$index]] = $childrenValue;
        }
    } else {
        $children = array(
            array_unique($childrenKeys)[0] => array(
                "value" => $childrenValues,
                "_attributes_" => null,
                "multi" => true,
            )
        );
    }

    if (count($children) === 0) {
        $children = (string) $xmlObject;
    }

    $xmlArray = array(
        $key => array(
            "value" => $children,
            "_attributes_" => $attributes,
            "_multi_" => $multi,
        )
    );

    return $xmlArray;
}

/**
 * Masking for string
 *
 * @param string $string  input string
 * @param string $pattern pattern for masked - consist by `%`
 *
 * <b>Example:</b><br>
 * $string = '79998887766';<br>
 * $pattern = '+%(%%%)%%%-%%-%%';<br>
 * return "+7(999)888-77-66"
 *
 * @return string
 */
function applyMask($string, $pattern)
{
    $string = (string) $string;
    $pattern = (string) $pattern;

    return vsprintf(str_replace('%', '%s', $pattern), str_split($string));
}

/**
 * Convert dec number to custom base, but not higher than 62
 *
 * @param integer|string $inputNumber number
 * @param boolean        $maxFilling  filling in missing characters with zeros
 * @param integer        $fillingLength
 * @param integer        $baseNumber  output base number to convert
 *
 * @return string
 */
public static function customBaseFromDec($inputNumber, $maxFilling = true, $fillingLength = 5, $baseNumber = 62)
{
    $base = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $r = $inputNumber % $baseNumber;
    $res = $base[$r];
    $q = floor($inputNumber / $baseNumber);
    while ($q) {
        $r = $q % $baseNumber;
        $q = floor($q / $baseNumber);
        $res = $base[$r] . $res;
    }

    if ($maxFilling === true) {
        $res = str_pad($res, $fillingLength, "0", STR_PAD_LEFT);
    }

    return $res;
}

/**
 * Convert custom base number to dec, but not higher than 62
 *
 * @param integer|string $inputNumber max 10 symbols
 * @param integer        $baseNumber
 *
 * @return string
 */
function customBaseToDec($inputNumber, $baseNumber = 62)
{
    $base = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $limit = strlen($inputNumber);
    $res = strpos($base, $inputNumber[0]);
    for ($i = 1; $i < $limit; $i++) {
        $res = $baseNumber * $res + strpos($base, $inputNumber[$i]);
    }

    return $res;
}

/**
 * Convert snake_case to camelCase
 * 
 * @param string $string
 *
 * @return string
 */
function snakeToCamelCase(string $string) : string {
    return str_replace("_", '', lcfirst(ucwords(strtolower($string), "_")));
}

/**
 * Convert camelCase to snake_case
 * 
 * @param string $string
 *
 * @return string
 */
function camelToSnakeCase(string $string): string {
    return trim(preg_replace_callback("/[A-Z]/", fn(array $matches) => "_" . strtolower($matches[0]), $string), "_");
}
