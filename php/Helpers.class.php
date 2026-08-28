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
     * Convert dec number to custom base, but not higher than 65
     *
     * @param int|string $inputNumber number
     * @param bool       $maxFilling  filling in missing characters with zeros
     * @param int        $fillingLength
     * @param int        $baseNumber  output base number to convert
     *
     * @return string
     */
    public static function customBaseFromDec(int|string $inputNumber, bool $maxFilling = true, int $fillingLength = 5, int $baseNumber = 65) : string {
        $r = $inputNumber % $baseNumber;
        $result = static::CUSTOM_BASE_DICTIONARY[$r];
        $q = floor($inputNumber / $baseNumber);
        while ($q) {
            $r = $q % $baseNumber;
            $q = floor($q / $baseNumber);
            $result = static::CUSTOM_BASE_DICTIONARY[$r] . $result;
        }

        if ($maxFilling === true) {
            $result = str_pad($result, $fillingLength, "0", STR_PAD_LEFT);
        }

        return $result;
    }

    /**
     * Convert custom base number to dec, but not higher than 65
     *
     * @param int|string $inputNumber     <b>TIP:</b> symbols not included in base number will
     *                                    removed
     * @param int        $baseNumber      input base number from convert
     *
     * @return string
     */
    public static function customBaseToDec(int|string $inputNumber, int $baseNumber = 65) : string {
        $inputNumber = preg_replace("/[^" . preg_quote(static::CUSTOM_BASE_DICTIONARY, "/") . "]/i", '', "{$inputNumber}");
        $limit = strlen($inputNumber);
        $result = strpos(static::CUSTOM_BASE_DICTIONARY, $inputNumber[0]);
        for ($i = 1; $i < $limit; $i++) {
            $result = $baseNumber * $result + strpos(static::CUSTOM_BASE_DICTIONARY, $inputNumber[$i]);
        }

        return $result;
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
    }public static function secondsToHumanreadable(float|int|string $seconds) : string {
        if (is_string($seconds) === true) {
            $seconds = (float) $seconds;
        }
        if($seconds == 0){
            return "0 мс.";
        }

        $settings = [
            "д."  => 24 * 60 * 60,
            "ч."  => 1 * 60 * 60,
            "м."  => 1 * 60,
            "с."  => 1,
            "мс." => 1 / 1000,
        ];

        $result = [];
        foreach ($settings as $label => $amount) {
            if ($amount <= $seconds){
                $current = (int) ($seconds / $amount);
                $result[] = ($current > 1000 ? static::number($current) : $current) ." {$label}";

                if($seconds == $current * $amount){
                    break;
                }

                $seconds -= $current * $amount;
            }
        }

        return implode(" ",$result);
    }

    /**
     * Forming pretty number , e.g. **12 123.12**
     *
     * @param int|float|string $number
     * @param string           $divisionSeparator
     * @param int              $tailLength
     * @param bool             $withZeroTail
     *
     * @return string
     */
    public static function number(int|float|string $number, string $divisionSeparator = ' ', int $tailLength = 2, bool $withZeroTail = false) : string {
        $number = round((float) $number, $tailLength);
        @list($number, $tail) = explode(".", "{$number}");

        if ($withZeroTail === true) {
            $tail = str_pad($tail, $tailLength, "0");
        }
        $number = str_split("{$number}", 1);

        if (count($number) > 3) {
            $divisions = floor((count($number) - 1) / 3);
            $number = array_reverse($number, false);
            for ($division = 1; $division <= $divisions; $division++) {
                $position = 3 * $division + ($division - 1);
                array_splice($number, $position, 0, $divisionSeparator);
            }
            $number = array_reverse($number, false);
        }

        if (empty($tail) === false) {
            $number[] = ".";
            $number[] = $tail;
        }

        return implode('', $number);
    }

    /**
     * Forming pretty back trace
     *
     * @return array
     */
    public static function prettyBackTrace() : array {
        $list = [];
        foreach (debug_backtrace() as $index => $call) {
            if (0 === $index) continue;
            $str = "#{$index}: ";
            if (true === isset($call['file'])) {
                $str.= "{$call["file"]}:{$call["line"]} - ";
            }
            if (true === isset($call['class'])) {
                $str.= "{$call["class"]}{$call["type"]}";
            }
            $list[] = "{$str}{$call["function"]}()";
        }

        return $list;
    }

    public function buildThrowableReport(\Throwable $e): string
    {
        $report = [];

        // Заголовок
        $report[] = str_repeat('=', 80);
        $report[] = 'ОТЧЁТ ОБ ИСКЛЮЧЕНИИ';
        $report[] = str_repeat('=', 80);
        $report[] = '';

        // Основная информация
        $report[] = '[' . date('Y-m-d H:i:s') . ']';
        $report[] = '';
        $report[] = 'ТИП:        ' . get_class($e);
        $report[] = 'СООБЩЕНИЕ:  ' . $e->getMessage();
        $report[] = 'КОД:        ' . $e->getCode();
        $report[] = 'ФАЙЛ:       ' . $e->getFile();
        $report[] = 'СТРОКА:     ' . $e->getLine();
        $report[] = '';

        // Трейс (стек вызовов) - в удобочитаемом формате
        $report[] = str_repeat('-', 80);
        $report[] = 'СТЕК ВЫЗОВОВ (TRACE):';
        $report[] = str_repeat('-', 80);
        $report[] = '';

        $trace = $e->getTrace();
        if (empty($trace)) {
            $report[] = '  (стек вызовов пуст)';
        } else {
            foreach ($trace as $index => $frame) {
                $report[] = sprintf(
                    '  #%d  %s%s%s(%s)',
                    $index,
                    $frame['file'] ?? '[internal]',
                    isset($frame['line']) ? ':' . $frame['line'] : '',
                    isset($frame['class']) ? ' ' . $frame['class'] . $frame['type'] : '',
                    $frame['function'] ?? '[anonymous]'
                );

                // Показываем аргументы (первые 3 для краткости)
                if (isset($frame['args']) && !empty($frame['args'])) {
                    $args = array_slice($frame['args'], 0, 3);
                    $argsStr = [];

                    foreach ($args as $arg) {
                        if (is_scalar($arg)) {
                            $argsStr[] = var_export($arg, true);
                        } elseif (is_array($arg)) {
                            $argsStr[] = 'array(' . count($arg) . ')';
                        } elseif (is_object($arg)) {
                            $argsStr[] = get_class($arg) . ' {...}';
                        } elseif (is_resource($arg)) {
                            $argsStr[] = 'resource(' . get_resource_type($arg) . ')';
                        } else {
                            $argsStr[] = gettype($arg);
                        }
                    }
                    if (count($frame['args']) > 3) {
                        $argsStr[] = '... (' . (count($frame['args']) - 3) . ' more)';
                    }
                    $report[] = '      args: ' . implode(', ', $argsStr);
                }
                $report[] = '';
            }
        }

        // Предыдущее исключение (если есть)
        if (null !== $e->getPrevious()) {
            $report[] = str_repeat('-', 80);
            $report[] = 'ПРЕДЫДУЩЕЕ ИСКЛЮЧЕНИЕ:';
            $report[] = str_repeat('-', 80);
            $report[] = '';
            $report[] = $this->buildThrowableReport($e->getPrevious());
        }

        // Дополнительные данные (если есть)
        if (method_exists($e, 'getAdditionalData')) {
            $report[] = str_repeat('-', 80);
            $report[] = 'ДОПОЛНИТЕЛЬНЫЕ ДАННЫЕ:';
            $report[] = str_repeat('-', 80);
            $report[] = '';
            $data = $e->getAdditionalData();
            if (is_array($data)) {
                foreach ($data as $key => $value) {
                    $report[] = '  ' . $key . ': ' . var_export($value, true);
                }
            } else {
                $report[] = var_export($data, true);
            }
            $report[] = '';
        }

        $report[] = str_repeat('=', 80);
        $report[] = 'КОНЕЦ ОТЧЁТА';
        $report[] = str_repeat('=', 80);

        return implode("\n", $report);
    }
}
