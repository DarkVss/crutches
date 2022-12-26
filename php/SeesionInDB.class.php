<?php

/**
 * <code>
 * $ttl = 30 * 24 * 60 * 60;
 * 
 * session_set_cookie_params($ttl, "/", SITE_HOST);
 * ini_set("session.gc_maxlifetime", $ttl);
 * ini_set("session.cookie_lifetime", $ttl);
 * ini_set("session.gc_probability", "1");
 *
 * session_set_save_handler(new \SessionInDB());
 * </code>
 */
final class SessionInDB implements \SessionHandlerInterface, \SessionIdInterface {
    public const TTL = 30 * 24 * 60 * 60;
    public const STORAGE = DIRECTORY_SEPARATOR . "tmp" . DIRECTORY_SEPARATOR;
    public const TABLE_NAME = "__sessions__";
    public const FIELD_ID = "id";
    public const FIELD_INFO = "info";
    public const FIELD_LAST_VISIT = "last_visit";
    public const FIELD_DATA = "data";

    public function __construct() { }

    /**
     * Initialize session
     * @link  https://php.net/manual/en/sessionhandlerinterface.open.php
     *
     * @param string $path The path where to store/retrieve the session.
     * @param string $name The session name.
     *
     * @return bool <p>
     * The return value (usually TRUE on success, FALSE on failure).
     * Note this value is returned internally to PHP for processing.
     * </p>
     * @since 5.4
     */
    public function open($path, $name) : bool { return true; }

    /**
     * Close the session
     * @link  https://php.net/manual/en/sessionhandlerinterface.close.php
     * @return bool <p>
     * The return value (usually TRUE on success, FALSE on failure).
     * Note this value is returned internally to PHP for processing.
     * </p>
     * @since 5.4
     */
    public function close() : bool { return true; }

    /**
     * Read session data
     * @link  https://php.net/manual/en/sessionhandlerinterface.read.php
     *
     * @param string $id The session id to read data for.
     *
     * @return string <p>
     * Returns an encoded string of the read data.
     * If nothing was read, it must return an empty string.
     * Note this value is returned internally to PHP for processing.
     * </p>
     * @since 5.4
     */
    public function read($id) : string {
        $inTransaction = \ORM::getDb()->inTransaction();
        try {
            if ($inTransaction === false) {
                \ORM::getDb()->beginTransaction();
            }

            $session = \ORM::forTable(static::TABLE_NAME)->findOne($id);
            if (empty($session) === true) {
                $deviceInfo = (new \foroco\BrowserDetection())->getAll($_SERVER["HTTP_USER_AGENT"] ?? '');

                $session = \ORM::forTable(static::TABLE_NAME)->create();
                $session->set([
                    static::FIELD_ID   => $id,
                    static::FIELD_INFO => ucfirst($deviceInfo["os_type"]) . ", {$deviceInfo["os_name"]}, IP Login: {$_SERVER["REMOTE_ADDR"]}",
                ]);
                $session->save();
                touch(static::STORAGE . $id . "session");
            }


            $session->set([
                static::FIELD_LAST_VISIT => time(),
            ]);
            $session->save();

            if ($inTransaction === false) {
                \ORM::getDb()->commit();
            }
        } catch (\Exception $e) {
            return '';
        }

        return html_entity_decode((string) $session->data);
    }

    /**
     * Write session data
     * @link  https://php.net/manual/en/sessionhandlerinterface.write.php
     *
     * @param string $id   The session id.
     * @param string $data <p>
     *                     The encoded session data. This data is the
     *                     result of the PHP internally encoding
     *                     the $_SESSION superglobal to a serialized
     *                     string and passing it as this parameter.
     *                     Please note sessions use an alternative serialization method.
     *                     </p>
     *
     * @return bool <p>
     * The return value (usually TRUE on success, FALSE on failure).
     * Note this value is returned internally to PHP for processing.
     * </p>
     * @since 5.4
     */
    public function write($id, $data) : bool {
        $inTransaction = \ORM::getDb()->inTransaction();
        try {
            if ($inTransaction === false) {
                \ORM::getDb()->beginTransaction();
            }
            $session = \ORM::forTable(static::TABLE_NAME)->findOne($id);
            if (empty($session) === true) {
                return false;
            }

            $session->set([
                static::FIELD_LAST_VISIT => time(),
                static::FIELD_DATA       => htmlentities($data, ENT_QUOTES),
            ]);
            $session->save();

            if ($inTransaction === false) {
                \ORM::getDb()->commit();
            }
        } catch (\Exception $e) {
            return false;
        }

        return true;
    }

    /**
     * Destroy a session
     * @link  https://php.net/manual/en/sessionhandlerinterface.destroy.php
     *
     * @param string $id The session ID being destroyed.
     *
     * @return bool <p>
     * The return value (usually TRUE on success, FALSE on failure).
     * Note this value is returned internally to PHP for processing.
     * </p>
     * @since 5.4
     */
    public function destroy($id) : bool {
        try {
            $session = \ORM::forTable(static::TABLE_NAME)->findOne($id);
            if (empty($session) === false) {
                $session->delete();
            }
        } catch (\Exception $e) {
            return false;
        }

        return true;
    }

    /**
     * Cleanup old sessions
     * @link  https://php.net/manual/en/sessionhandlerinterface.gc.php
     *
     * @param int $max_lifetime <p>
     *                          Sessions that have not updated for
     *                          the last maxlifetime seconds will be removed.
     *                          </p>
     *
     * @return bool <p>
     * The return value (usually TRUE on success, FALSE on failure).
     * Note this value is returned internally to PHP for processing.
     * </p>
     * @since 5.4
     */
    public function gc($max_lifetime) : bool {
        $current_time = time();

        try {
            \ORM::forTable(static::TABLE_NAME)
                ->whereRaw(static::FIELD_LAST_VISIT . " + {$max_lifetime}  < {$current_time}")
                ->delete_many();
        } catch (\Exception $e) {
            return false;
        }

        return true;
    }


    /**
     * Create session ID
     * @link https://php.net/manual/en/sessionidinterface.create-sid.php
     * @return string
     */
    public function create_sid() : string {
        return \Util\Helpers::generateULID() . "_" . \Util\Helpers::generateULID();
    }
}