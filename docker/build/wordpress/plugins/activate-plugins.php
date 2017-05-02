
/**
 * Activate required plugins
 */
include_once ( ABSPATH . 'wp-admin/includes/plugin.php' );
foreach (array(
    'plugin-name',
) as $plugin) {
    $path = sprintf('%s/%s.php', $plugin, $plugin);
    if (!is_plugin_active( $path )) {
        activate_plugin( $path );
    }
}