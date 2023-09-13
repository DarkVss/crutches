<?php

final class Helpers {
    public static function extractClassname(string $classname) : string { return substr(strrchr($classname, "\\") ?: $classname, 1); }

    public static function convertCamelCaseToSnakeCase(string $text) : string {
        return str_replace("__", "_", strtolower(preg_replace("/[A-Z]([A-Z](?![a-z]))*/", "_$0", lcfirst($text))));
    }

    public static function convertSnakeCaseToCamelCase(string $text) : string {
        return ucwords(str_replace("_", '', ucwords($text, "_")));
    }

    /**
     * @param array  $data
     * @param string $column
     * @param int    $sort
     * @param mixed  ...$rest pairs like two previously $args
     *
     * @return array
     */
    public static function arrayOrderBy(array $data, string $column, int $sort, ...$rest) : array {
        $args = [$column, $sort, ...$rest];
        foreach ($args as $n => $field) {
            if (is_string($field) === true) {
                $tmp = [];
                foreach ($data as $key => $row) {
                    $tmp[$key] = $row[$field];
                }
                $args[$n] = $tmp;
            }
        }
        $args[] = &$data;
        array_multisort(...$args);

        return array_pop($args);
    }
}
