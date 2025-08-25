-- SETUP_ARTICLES_MULTILINGUAL.sql
-- This script sets up the articles table with full multilingual support
-- Run this in your Supabase SQL editor

-- Create articles table if it doesn't exist
CREATE TABLE IF NOT EXISTS articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    author TEXT,
    category TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    slug TEXT UNIQUE,
    featured_image TEXT,
    read_time INTEGER DEFAULT 0,
    tags TEXT[],
    
    -- Multilingual fields
    titles JSONB DEFAULT '{}',
    contents JSONB DEFAULT '{}',
    excerpts JSONB DEFAULT '{}',
    authors_multilingual JSONB DEFAULT '{}',
    categories_multilingual JSONB DEFAULT '{}'
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(is_published);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);

-- Create GIN indexes for JSONB fields for better search performance
CREATE INDEX IF NOT EXISTS idx_articles_titles_gin ON articles USING GIN (titles);
CREATE INDEX IF NOT EXISTS idx_articles_contents_gin ON articles USING GIN (contents);
CREATE INDEX IF NOT EXISTS idx_articles_excerpts_gin ON articles USING GIN (excerpts);

-- Enable Row Level Security (RLS)
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access to published articles
CREATE POLICY "Public can view published articles" ON articles
    FOR SELECT USING (is_published = true);

-- Create policies for authenticated users to manage articles
CREATE POLICY "Authenticated users can manage articles" ON articles
    FOR ALL USING (auth.role() = 'authenticated');

-- Insert some sample articles for testing
INSERT INTO articles (
    title,
    content,
    excerpt,
    author,
    category,
    is_published,
    slug,
    read_time,
    titles,
    contents,
    excerpts,
    authors_multilingual,
    categories_multilingual
) VALUES 
(
    'Welcome to AFTEK Articles',
    '<p>This is the first article on the AFTEK website. Here you can learn about our latest news, industry insights, and technical articles.</p>',
    'Welcome to our new articles section where we share industry insights and company updates.',
    'AFTEK Team',
    'Company News',
    true,
    'welcome-to-aftek-articles',
    3,
    '{"en": "Welcome to AFTEK Articles", "zh-Hant": "歡迎來到 AFTEK 文章", "zh-Hans": "欢迎来到 AFTEK 文章", "ja": "AFTEK 記事へようこそ", "ko": "AFTEK 기사에 오신 것을 환영합니다", "th": "ยินดีต้อนรับสู่บทความ AFTEK", "vi": "Chào mừng đến với bài viết AFTEK"}',
    '{"en": "<p>This is the first article on the AFTEK website. Here you can learn about our latest news, industry insights, and technical articles.</p>", "zh-Hant": "<p>這是 AFTEK 網站上的第一篇文章。在這裡，您可以了解我們的最新消息、行業見解和技術文章。</p>", "zh-Hans": "<p>这是 AFTEK 网站上的第一篇文章。在这里，您可以了解我们的最新消息、行业见解和技术文章。</p>", "ja": "<p>これは AFTEK ウェブサイトの最初の記事です。ここでは、最新のニュース、業界の洞察、技術記事について学ぶことができます。</p>", "ko": "<p>이것은 AFTEK 웹사이트의 첫 번째 기사입니다. 여기서 최신 뉴스, 업계 인사이트 및 기술 기사에 대해 배울 수 있습니다.</p>", "th": "<p>นี่คือบทความแรกในเว็บไซต์ AFTEK ที่นี่คุณสามารถเรียนรู้เกี่ยวกับข่าวสารล่าสุด ข้อมูลเชิงลึกของอุตสาหกรรม และบทความทางเทคนิค</p>", "vi": "<p>Đây là bài viết đầu tiên trên trang web AFTEK. Tại đây, bạn có thể tìm hiểu về tin tức mới nhất, thông tin chi tiết về ngành và các bài viết kỹ thuật.</p>"}',
    '{"en": "Welcome to our new articles section where we share industry insights and company updates.", "zh-Hant": "歡迎來到我們新的文章專區，我們在這裡分享行業見解和公司更新。", "zh-Hans": "欢迎来到我们新的文章专区，我们在这里分享行业见解和公司更新。", "ja": "業界の洞察と会社の更新を共有する新しい記事セクションへようこそ。", "ko": "업계 인사이트와 회사 업데이트를 공유하는 새로운 기사 섹션에 오신 것을 환영합니다.", "th": "ยินดีต้อนรับสู่ส่วนบทความใหม่ของเรา ที่เราจะแบ่งปันข้อมูลเชิงลึกของอุตสาหกรรมและการอัปเดตของบริษัท", "vi": "Chào mừng đến với phần bài viết mới của chúng tôi, nơi chúng tôi chia sẻ thông tin chi tiết về ngành và cập nhật công ty."}',
    '{"en": "AFTEK Team", "zh-Hant": "AFTEK 團隊", "zh-Hans": "AFTEK 团队", "ja": "AFTEK チーム", "ko": "AFTEK 팀", "th": "ทีม AFTEK", "vi": "Đội ngũ AFTEK"}',
    '{"en": "Company News", "zh-Hant": "公司新聞", "zh-Hans": "公司新闻", "ja": "会社ニュース", "ko": "회사 뉴스", "th": "ข่าวบริษัท", "vi": "Tin tức công ty"}'
),
(
    'Industry Trends in Adhesives and Coatings',
    '<p>The adhesives and coatings industry is experiencing significant growth with new technologies and sustainable solutions emerging. This article explores the latest trends and what they mean for manufacturers and end users.</p>',
    'Explore the latest trends in adhesives and coatings, from sustainable solutions to advanced technologies.',
    'Industry Expert',
    'Industry News',
    true,
    'industry-trends-adhesives-coatings',
    5,
    '{"en": "Industry Trends in Adhesives and Coatings", "zh-Hant": "黏合劑和塗料行業趨勢", "zh-Hans": "黏合剂和涂料行业趋势", "ja": "接着剤・コーティング業界のトレンド", "ko": "접착제 및 코팅 산업 동향", "th": "แนวโน้มอุตสาหกรรมในกาวและสารเคลือบ", "vi": "Xu hướng ngành công nghiệp trong chất kết dính và lớp phủ"}',
    '{"en": "<p>The adhesives and coatings industry is experiencing significant growth with new technologies and sustainable solutions emerging. This article explores the latest trends and what they mean for manufacturers and end users.</p>", "zh-Hant": "<p>黏合劑和塗料行業正在經歷顯著增長，新技術和可持續解決方案不斷湧現。本文探討了最新趨勢及其對製造商和終端用戶的意義。</p>", "zh-Hans": "<p>黏合剂和涂料行业正在经历显著增长，新技术和可持续解决方案不断涌现。本文探讨了最新趋势及其对制造商和终端用户的意义。</p>", "ja": "<p>接着剤・コーティング業界は、新技術と持続可能なソリューションの台頭により、大幅な成長を遂げています。この記事では、最新のトレンドとそれがメーカーとエンドユーザーにとって何を意味するかを探ります。</p>", "ko": "<p>접착제 및 코팅 산업은 새로운 기술과 지속 가능한 솔루션의 출현으로 상당한 성장을 경험하고 있습니다. 이 기사는 최신 동향과 제조업체 및 최종 사용자에게 의미하는 바를 탐구합니다.</p>", "th": "<p>อุตสาหกรรมกาวและสารเคลือบกำลังประสบกับการเติบโตอย่างมีนัยสำคัญพร้อมกับเทคโนโลยีใหม่และโซลูชันที่ยั่งยืนที่เกิดขึ้น บทความนี้สำรวจแนวโน้มล่าสุดและความหมายต่อผู้ผลิตและผู้ใช้ปลายทาง</p>", "vi": "<p>Ngành công nghiệp chất kết dính và lớp phủ đang trải qua sự tăng trưởng đáng kể với các công nghệ mới và giải pháp bền vững đang nổi lên. Bài viết này khám phá các xu hướng mới nhất và ý nghĩa của chúng đối với các nhà sản xuất và người dùng cuối.</p>"}',
    '{"en": "Explore the latest trends in adhesives and coatings, from sustainable solutions to advanced technologies.", "zh-Hant": "探索黏合劑和塗料的最新趨勢，從可持續解決方案到先進技術。", "zh-Hans": "探索黏合剂和涂料的最新趋势，从可持续解决方案到先进技术。", "ja": "持続可能なソリューションから先進技術まで、接着剤・コーティングの最新トレンドを探る。", "ko": "지속 가능한 솔루션부터 첨단 기술까지 접착제 및 코팅의 최신 동향을 탐구하세요.", "th": "สำรวจแนวโน้มล่าสุดในกาวและสารเคลือบ ตั้งแต่โซลูชันที่ยั่งยืนไปจนถึงเทคโนโลยีขั้นสูง", "vi": "Khám phá các xu hướng mới nhất trong chất kết dính và lớp phủ, từ các giải pháp bền vững đến công nghệ tiên tiến."}',
    '{"en": "Industry Expert", "zh-Hant": "行業專家", "zh-Hans": "行业专家", "ja": "業界専門家", "ko": "업계 전문가", "th": "ผู้เชี่ยวชาญด้านอุตสาหกรรม", "vi": "Chuyên gia ngành công nghiệp"}',
    '{"en": "Industry News", "zh-Hant": "行業新聞", "zh-Hans": "行业新闻", "ja": "業界ニュース", "ko": "업계 뉴스", "th": "ข่าวอุตสาหกรรม", "vi": "Tin tức ngành công nghiệp"}'
)
ON CONFLICT (slug) DO NOTHING;

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_articles_updated_at 
    BEFORE UPDATE ON articles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT ALL ON articles TO authenticated;
GRANT SELECT ON articles TO anon;

-- Enable realtime for articles table (optional, for real-time updates)
ALTER PUBLICATION supabase_realtime ADD TABLE articles;
