import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2 } from "lucide-react";

// Message type for chat
interface ChatMessage {
  id: string;
  type: 'chat' | 'system' | 'welcome';
  from: string;
  message: string;
  timestamp: string;
}

export function ChatBox({ userName = "User" }: { userName?: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const messageEndRef = useRef<HTMLDivElement>(null);

  // Connect to WebSocket server
  useEffect(() => {
    const connectWebSocket = () => {
      setConnecting(true);
      
      // Use the correct protocol based on whether we're using HTTPS or HTTP
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      console.log("Connecting to WebSocket server at:", wsUrl);
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("WebSocket connection established");
        setConnected(true);
        setConnecting(false);
        
        // Add system message for connection
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            type: 'system',
            from: 'System',
            message: 'Connected to chat server',
            timestamp: new Date().toISOString()
          }
        ]);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("Received message:", data);
          
          // Add the received message to our messages state
          setMessages(prev => [
            ...prev,
            {
              id: Date.now().toString(),
              type: data.type,
              from: data.from || 'Server',
              message: data.message,
              timestamp: data.timestamp || new Date().toISOString()
            }
          ]);
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      ws.onclose = () => {
        console.log("WebSocket connection closed");
        setConnected(false);
        setConnecting(false);
        
        // Add system message for disconnection
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            type: 'system',
            from: 'System',
            message: 'Disconnected from chat server',
            timestamp: new Date().toISOString()
          }
        ]);
        
        // Try to reconnect after a delay
        setTimeout(() => {
          if (document.visibilityState === 'visible') {
            connectWebSocket();
          }
        }, 3000);
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setConnected(false);
        setConnecting(false);
      };

      setSocket(ws);
    };

    connectWebSocket();

    // Cleanup function
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, []); // Empty dependency array means this effect runs once on mount

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send a message
  const sendMessage = () => {
    if (!messageInput.trim() || !socket || socket.readyState !== WebSocket.OPEN) return;

    const message = {
      type: 'chat',
      from: userName,
      message: messageInput
    };

    socket.send(JSON.stringify(message));
    setMessageInput("");
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="bg-primary/5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Advisor Chat</CardTitle>
          <Badge variant={connected ? "default" : "destructive"}>
            {connecting ? "Connecting..." : (connected ? "Connected" : "Disconnected")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px] p-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p>No messages yet. Start chatting!</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div 
                key={msg.id}
                className={`flex gap-2 mb-4 ${msg.from === userName ? 'justify-end' : 'justify-start'}`}
              >
                {msg.from !== userName && msg.type !== 'system' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{msg.from.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}
                
                <div 
                  className={`p-3 rounded-lg max-w-[80%] ${
                    msg.type === 'system' 
                      ? 'bg-gray-100 text-gray-600 text-center w-full text-sm italic' 
                      : msg.from === userName 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                  }`}
                >
                  {msg.type !== 'system' && msg.from !== userName && (
                    <p className="text-xs font-semibold mb-1">{msg.from}</p>
                  )}
                  <p>{msg.message}</p>
                  <p className="text-xs opacity-70 text-right mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                </div>
                
                {msg.from === userName && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{msg.from.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))
          )}
          <div ref={messageEndRef} />
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-3 border-t">
        <div className="flex w-full items-center space-x-2">
          <Input
            placeholder="Type your message..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={!connected}
            className="flex-1"
          />
          <Button 
            onClick={sendMessage} 
            disabled={!connected || connecting || !messageInput.trim()}
            size="icon"
          >
            {connecting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}