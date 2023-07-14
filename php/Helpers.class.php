<?php

final class Helpers {
    public static function extractClassname(string $classname) : string { return substr(strrchr($classname, "\\") ?: $classname, 1); }

    public static function convertCamelCaseToSnakeCase(string $text) : string {
        return str_replace("__", "_", strtolower(preg_replace("/[A-Z]([A-Z](?![a-z]))*/", "_$0", lcfirst($text))));
    }

    public static function convertSnakeCaseToCamelCase(string $text) : string {
        return ucwords(str_replace("_", '', ucwords($text, "_")));
    }
}
