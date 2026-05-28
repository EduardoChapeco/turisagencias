-- Enable pg_cron extension if not already enabled
create extension if not exists pg_cron;

-- Create a function to delete unread news older than 30 days
create or replace function delete_unread_market_news()
returns void as $$
begin
  -- Delete news that haven't been read (read_count = 0) and were published more than 30 days ago
  delete from public.market_news
  where read_count = 0
  and published_at < now() - interval '30 days';
end;
$$ language plpgsql security definer;

-- Schedule the cron job to run daily at midnight
select cron.schedule(
  'delete-unread-market-news-daily',
  '0 0 * * *',
  'select delete_unread_market_news()'
);
