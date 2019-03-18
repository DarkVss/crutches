<?php

$array = array(
    array(
        "key" => "package",
        "\$_attributes" => array(
            "login" => "login",
            "password" => "123456",
        ),
        "value" => array(
            array(
                "key" => "message",
                "value" => array(
                    array(
                        "key" => "default",
                        "\$_attributes" => array(
                            "sender" => "SMSINFO"
                        ),
                    ),
                    array(
                        "key" => "msg",
                        "value" => "text",
                        "\$_attributes" => array(
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
                        "\$_attributes" => array(
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
/**
 * Конвертер массив к xml
*/
function _buildXML($data, $parentKey = "root", &$xml = "")
{
    foreach ($data as $datum) {
        if (isset($datum["key"])) {
            $key = $datum["key"];
            //Проверяем что рассматриваемый элемент это не набор атрибутов
            if ($key !== '_attributes_') {
                $value = isset($datum["value"]) ? $datum["value"] : "";//значение тега - либо вложенные теги(массив), либо просто значение - str,int n etc.

                $attributes = array();
                if (isset($datum["\_attributes_"])) {
                    foreach ($datum["\_attributes_"] as $attributeKey => $attributeValue) {
                        $attributes[] =
                            "{$attributeKey}=\"" . str_replace('"', '\"', (string) $attributeValue) . "\"";
                    }
                }
                $attributes = implode(" ", $attributes);

                $xml .= "<$key $attributes" . (empty($value) ? "/" : "") . ">";

                if (is_array($value)) {
                    _buildXML($value, $key, $xml);
                } else {
                    $xml .= (string) $value;
                }

                if(!empty($value)){
                    $xml .= "</$key>";
                }
            }
        }
    }
    return $xml;
}

echo _buildXML($array);
