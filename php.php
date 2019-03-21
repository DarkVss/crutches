<?php

/**
     * Build xml string from array
     * Example array and output string in begin function
     *
     * @param array  $data
     * @param string $parentKey
     * @param string $xml
     *
     * @return string
     */
    private function _buildXML($data, $parentKey = "root", &$xml = "")
    {
        /*
         * Input array
         * $array = array(
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
        *
        * Output string
        <package login="login" password="123456">
            <message>
                <default sender="SMSINFO"/>
                <msg id="1234" recipient="+79021234567" sender="SMSINFO" date_beg="2008-12-27T15:55" date_end="2008-12-28T15:55"
                     type="0">text
                </msg>
                <msg recipient="+79021234567">text</msg>
                <items>
                    <item>123456789</item>
                    <item>987654321</item>
                </items>
            </message>
        </package>
        */

        foreach ($data as $datum) {
            if (isset($datum["key"])) {
                $key = $datum["key"];
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

                    if (is_array($value)) {
                        //Если значение это массив значит внутри набор элементов
                        _buildXML($value, $key, $xml);
                    } else {
                        $xml .= (string) $value;
                    }

                    if (!empty($value)) {
                        $xml .= "</$key>";
                    }
                }
            }
        }
        return $xml;
    }

echo _buildXML($array);
