package in.pinglix.realtime;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;

import in.pinglix.config.CorsProperties;
import in.pinglix.config.WebSocketConfig;
import org.junit.jupiter.api.Test;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.StompWebSocketEndpointRegistration;

class WebSocketConfigTest {

    @Test
    void registersWebSocketEndpointWithConfiguredFrontendOrigin() {
        StompEndpointRegistry registry = mock(StompEndpointRegistry.class);
        StompWebSocketEndpointRegistration registration = mock(
                StompWebSocketEndpointRegistration.class
        );
        when(registry.addEndpoint("/ws")).thenReturn(registration);
        when(registration.setAllowedOrigins("http://localhost:5174"))
                .thenReturn(registration);
        WebSocketConfig config = new WebSocketConfig(
                new CorsProperties(List.of("http://localhost:5174")),
                mock(WebSocketAuthChannelInterceptor.class)
        );

        config.registerStompEndpoints(registry);

        verify(registry).addEndpoint("/ws");
        verify(registration).setAllowedOrigins("http://localhost:5174");
    }
}
