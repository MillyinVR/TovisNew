import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Calendar, Clock, RefreshCw, Settings } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '../ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select';

interface CalendarConnectionProps {
  calendarSync: boolean;
  calendarProvider?: 'google' | 'outlook' | 'apple';
  onConnect: (provider: 'google' | 'outlook' | 'apple') => Promise<void>;
  onDisconnect: () => Promise<void>;
  lastSynced?: Date;
}

export const CalendarConnection: React.FC<CalendarConnectionProps> = ({
  calendarSync,
  calendarProvider,
  onConnect,
  onDisconnect,
  lastSynced
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [syncFrequency, setSyncFrequency] = useState('15');

  const handleConnect = async (provider: 'google' | 'outlook' | 'apple') => {
    setIsLoading(true);
    try {
      await onConnect(provider);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    try {
      await onDisconnect();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Calendar Connection
        </CardTitle>
        <CardDescription>
          Connect your calendar to sync appointments and availability
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant={calendarSync ? 'default' : 'destructive'}>
              {calendarSync ? 'Connected' : 'Not Connected'}
            </Badge>
            {calendarProvider && (
              <span className="text-sm text-muted-foreground">
                ({calendarProvider})
              </span>
            )}
          </div>

          {calendarSync ? (
            <Button
              variant="destructive"
              onClick={handleDisconnect}
              disabled={isLoading}
            >
              Disconnect
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleConnect('google')}
                disabled={isLoading}
              >
                Connect Google
              </Button>
              <Button
                variant="outline"
                onClick={() => handleConnect('outlook')}
                disabled={isLoading}
              >
                Connect Outlook
              </Button>
              <Button
                variant="outline"
                onClick={() => handleConnect('apple')}
                disabled={isLoading}
              >
                Connect Apple
              </Button>
            </div>
          )}
        </div>

        {calendarSync && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4" />
              <span>Last synced:</span>
              <span className="font-medium">
                {lastSynced ? lastSynced.toLocaleString() : 'Never'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span>Sync frequency:</span>
              <Select
                value={syncFrequency}
                onValueChange={setSyncFrequency}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </CardContent>
      {calendarSync && (
        <CardFooter className="flex justify-end">
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Sync Now
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};
