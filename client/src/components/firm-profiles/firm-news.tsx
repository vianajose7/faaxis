import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Newspaper, 
  Users, 
  ArrowUpRight, 
  Calendar,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface NewsItem {
  title: string;
  excerpt: string;
  date: string;
  source: string;
  sourceUrl: string;
  imageUrl?: string;
  category: 'move' | 'firm' | 'industry';
}

interface FirmNewsProps {
  firmName: string;
  recentNews: NewsItem[];
}

export function FirmNews({ firmName, recentNews }: FirmNewsProps) {
  const [activeTab, setActiveTab] = useState<'move' | 'firm' | 'industry'>('move');
  
  const filteredNews = recentNews.filter(news => news.category === activeTab);
  
  return (
    <Card>
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-6 flex items-center">
          <Newspaper className="text-primary mr-2 h-5 w-5" />
          Latest {firmName} News
        </h2>
        
        <Tabs defaultValue="move" onValueChange={(val) => setActiveTab(val as 'move' | 'firm' | 'industry')}>
          <TabsList className="mb-6">
            <TabsTrigger value="move">Advisor Moves</TabsTrigger>
            <TabsTrigger value="firm">Firm News</TabsTrigger>
            <TabsTrigger value="industry">Industry Impact</TabsTrigger>
          </TabsList>
          
          <TabsContent value="move" className="mt-0 space-y-6">
            {filteredNews.length > 0 ? (
              filteredNews.map((news, index) => (
                <NewsCard key={index} news={news} />
              ))
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground opacity-30 mx-auto mb-4" />
                <p className="text-muted-foreground">No recent advisor movement news for {firmName}</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="firm" className="mt-0 space-y-6">
            {filteredNews.length > 0 ? (
              filteredNews.map((news, index) => (
                <NewsCard key={index} news={news} />
              ))
            ) : (
              <div className="text-center py-8">
                <Newspaper className="h-12 w-12 text-muted-foreground opacity-30 mx-auto mb-4" />
                <p className="text-muted-foreground">No recent firm news for {firmName}</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="industry" className="mt-0 space-y-6">
            {filteredNews.length > 0 ? (
              filteredNews.map((news, index) => (
                <NewsCard key={index} news={news} />
              ))
            ) : (
              <div className="text-center py-8">
                <Newspaper className="h-12 w-12 text-muted-foreground opacity-30 mx-auto mb-4" />
                <p className="text-muted-foreground">No recent industry news related to {firmName}</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 flex justify-center">
          <Button variant="outline">
            View All {firmName} News
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

function NewsCard({ news }: { news: NewsItem }) {
  // Format the date to show how long ago
  const formattedDate = formatDistanceToNow(new Date(news.date), { addSuffix: true });
  
  return (
    <div className="border border-border rounded-lg overflow-hidden flex flex-col md:flex-row">
      {news.imageUrl && (
        <div className="md:w-1/4 bg-muted/30">
          <img 
            src={news.imageUrl} 
            alt={`Illustration for ${news.title}`}
            className="w-full h-48 md:h-full object-cover"
          />
        </div>
      )}
      
      <div className={`p-6 flex-1 ${news.imageUrl ? 'md:w-3/4' : 'w-full'}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded">
            {news.source}
          </span>
          <span className="text-xs text-muted-foreground flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            {formattedDate}
          </span>
        </div>
        
        <h3 className="text-lg font-medium mb-2">{news.title}</h3>
        <p className="text-muted-foreground text-sm mb-4">{news.excerpt}</p>
        
        <a 
          href={news.sourceUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="inline-flex items-center text-primary hover:underline text-sm"
        >
          Read Full Article
          <ExternalLink className="ml-1 h-3 w-3" />
        </a>
      </div>
    </div>
  );
}