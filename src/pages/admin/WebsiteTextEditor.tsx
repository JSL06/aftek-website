import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, ArrowLeft, Globe, FileText, Home, Users, Package, Building, Newspaper, Phone, MessageSquare, Settings, Image, BookOpen, Info, Languages, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/useTranslation';
import enTranslations from '@/locales/en';
import jaTranslations from '@/locales/ja';
import koTranslations from '@/locales/ko';
import thTranslations from '@/locales/th';
import viTranslations from '@/locales/vi';
import zhHansTranslations from '@/locales/zh-Hans';
import zhHantTranslations from '@/locales/zh-Hant';

type Language = 'en' | 'ja' | 'ko' | 'th' | 'vi' | 'zh-Hans' | 'zh-Hant';

interface WebsiteText {
  key: string;
  section: string;
  language: Language;
  value: string;
}

interface TextField {
  key: string;
  label: string;
  description: string;
  placeholder: string;
  type: 'text' | 'textarea' | 'long-text';
  required?: boolean;
}

const LANGUAGES: { code: Language; name: string; flag: string; nativeName: string }[] = [
  { code: 'en', name: 'English', flag: '🇺🇸', nativeName: 'English' },
  { code: 'ja', name: '日本語', flag: '🇯🇵', nativeName: '日本語' },
  { code: 'ko', name: '한국어', flag: '🇰🇷', nativeName: '한국어' },
  { code: 'th', name: 'ไทย', flag: '🇹🇭', nativeName: 'ไทย' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳', nativeName: 'Tiếng Việt' },
  { code: 'zh-Hans', name: '简体中文', flag: '🇨🇳', nativeName: '简体中文' },
  { code: 'zh-Hant', name: '繁體中文', flag: '🇹🇼', nativeName: '繁體中文' },
];

// SECTIONS moved inside the component function to use translations

// Define text fields for each section with descriptions
const TEXT_FIELDS: Record<string, TextField[]> = {
  navigation: [
    {
      key: 'nav.home',
      label: '首页菜单项',
      description: '导航菜单中首页页面的显示文本',
      placeholder: '输入首页菜单文本...',
      type: 'text',
      required: true
    },
    {
      key: 'nav.about',
      label: '关于菜单项',
      description: '导航菜单中关于页面的显示文本',
      placeholder: '输入关于菜单文本...',
      type: 'text',
      required: true
    },
    {
      key: 'nav.products',
      label: '产品菜单项',
      description: '导航菜单中产品页面的显示文本',
      placeholder: '输入产品菜单文本...',
      type: 'text',
      required: true
    },
    {
      key: 'nav.projects',
      label: '项目菜单项',
      description: '导航菜单中项目页面的显示文本',
      placeholder: '输入项目菜单文本...',
      type: 'text',
      required: true
    },
    {
      key: 'nav.articles',
      label: '文章菜单项',
      description: '导航菜单中文章页面的显示文本',
      placeholder: '输入文章菜单文本...',
      type: 'text',
      required: true
    },
    {
      key: 'nav.guide',
      label: '指南菜单项',
      description: '导航菜单中指南页面的显示文本',
      placeholder: '输入指南菜单文本...',
      type: 'text',
      required: true
    },
    {
      key: 'nav.contact',
      label: '联系菜单项',
      description: '导航菜单中联系页面的显示文本',
      placeholder: '输入联系菜单文本...',
      type: 'text',
      required: true
    }
  ],
  home: [
    {
      key: 'home.hero.title',
      label: '主标题',
      description: '出现在主页顶部的大型主标题',
      placeholder: '输入主标题...',
      type: 'text',
      required: true
    },
    {
      key: 'home.hero.subtitle',
      label: '副标题',
      description: '出现在主标题下方的副标题',
      placeholder: '输入副标题...',
      type: 'textarea',
      required: true
    },
    {
      key: 'home.hero.aboutBtn',
      label: '关于我们按钮',
      description: '链接到关于页面的按钮文本',
      placeholder: '输入关于我们按钮文本...',
      type: 'text',
      required: true
    },
    {
      key: 'home.hero.companyProfileBtn',
      label: '公司简介按钮',
      description: '下载公司简介PDF的按钮文本',
      placeholder: '输入公司简介按钮文本...',
      type: 'text',
      required: true
    },
    {
      key: 'home.mission.title',
      label: '使命宣言标题',
      description: '使命宣言部分的标题',
      placeholder: '输入使命宣言标题...',
      type: 'text',
      required: true
    },
    {
      key: 'home.mission.content',
      label: '使命宣言内容',
      description: '公司使命宣言的所有段落内容（用换行符分隔段落）',
      placeholder: '输入第一段内容...\n\n输入第二段内容...\n\n可以继续添加更多段落...',
      type: 'long-text',
      required: true
    },
    {
      key: 'home.services.title',
      label: '服务部分标题',
      description: '主页服务部分的标题',
      placeholder: '输入服务部分标题...',
      type: 'text',
      required: true
    },
    {
      key: 'home.services.subtitle',
      label: '服务部分副标题',
      description: '服务部分的副标题',
      placeholder: '输入服务部分副标题...',
      type: 'textarea',
      required: true
    },
    {
      key: 'home.services.sealants.title',
      label: '密封剂服务标题',
      description: '密封剂和胶黏剂服务的标题',
      placeholder: '输入密封剂服务标题...',
      type: 'text',
      required: true
    },
    {
      key: 'home.services.sealants.desc',
      label: '密封剂服务描述',
      description: '密封剂和胶黏剂服务的详细描述',
      placeholder: '输入密封剂服务描述...',
      type: 'textarea',
      required: true
    },
    {
      key: 'home.services.waterproofing.title',
      label: '防水服务标题',
      description: '防水系统服务的标题',
      placeholder: '输入防水服务标题...',
      type: 'text',
      required: true
    },
    {
      key: 'home.services.waterproofing.desc',
      label: '防水服务描述',
      description: '防水系统服务的详细描述',
      placeholder: '输入防水服务描述...',
      type: 'textarea',
      required: true
    },
    {
      key: 'home.services.flooring.title',
      label: '地板服务标题',
      description: '地板和环氧树脂服务的标题',
      placeholder: '输入地板服务标题...',
      type: 'text',
      required: true
    },
    {
      key: 'home.services.flooring.desc',
      label: '地板服务描述',
      description: '地板和环氧树脂服务的详细描述',
      placeholder: '输入地板服务描述...',
      type: 'textarea',
      required: true
    },
    {
      key: 'home.services.grout.title',
      label: '灌浆服务标题',
      description: 'Redi-Mix G&M灌浆服务的标题',
      placeholder: '输入灌浆服务标题...',
      type: 'text',
      required: true
    },
    {
      key: 'home.services.grout.desc',
      label: '灌浆服务描述',
      description: 'Redi-Mix G&M灌浆服务的详细描述',
      placeholder: '输入灌浆服务描述...',
      type: 'textarea',
      required: true
    },
    {
      key: 'home.projects.title',
      label: '项目部分标题',
      description: '主页项目展示部分的标题',
      placeholder: '输入项目部分标题...',
      type: 'text',
      required: true
    },
    {
      key: 'home.projects.subtitle',
      label: '项目部分副标题',
      description: '项目展示部分的副标题',
      placeholder: '输入项目部分副标题...',
      type: 'textarea',
      required: true
    },
    {
      key: 'home.projects.project1.title',
      label: '项目1标题',
      description: '第一个展示项目的标题',
      placeholder: '输入项目1标题...',
      type: 'text',
      required: true
    },
    {
      key: 'home.projects.project1.location',
      label: '项目1位置',
      description: '第一个展示项目的位置',
      placeholder: '输入项目1位置...',
      type: 'text',
      required: true
    },
    {
      key: 'home.projects.project1.image',
      label: '项目1图片描述',
      description: '第一个展示项目的图片描述',
      placeholder: '输入项目1图片描述...',
      type: 'text',
      required: true
    },
    {
      key: 'home.projects.project1.category',
      label: '项目1类别',
      description: '第一个展示项目的类别',
      placeholder: '输入项目1类别...',
      type: 'text',
      required: true
    },
    {
      key: 'home.projects.project2.title',
      label: '项目2标题',
      description: '第二个展示项目的标题',
      placeholder: '输入项目2标题...',
      type: 'text',
      required: true
    },
    {
      key: 'home.projects.project2.location',
      label: '项目2位置',
      description: '第二个展示项目的位置',
      placeholder: '输入项目2位置...',
      type: 'text',
      required: true
    },
    {
      key: 'home.projects.project2.image',
      label: '项目2图片描述',
      description: '第二个展示项目的图片描述',
      placeholder: '输入项目2图片描述...',
      type: 'text',
      required: true
    },
    {
      key: 'home.projects.project2.category',
      label: '项目2类别',
      description: '第二个展示项目的类别',
      placeholder: '输入项目2类别...',
      type: 'text',
      required: true
    },
    {
      key: 'home.projects.project3.title',
      label: '项目3标题',
      description: '第三个展示项目的标题',
      placeholder: '输入项目3标题...',
      type: 'text',
      required: true
    },
    {
      key: 'home.projects.project3.location',
      label: '项目3位置',
      description: '第三个展示项目的位置',
      placeholder: '输入项目3位置...',
      type: 'text',
      required: true
    },
    {
      key: 'home.projects.project3.image',
      label: '项目3图片描述',
      description: '第三个展示项目的图片描述',
      placeholder: '输入项目3图片描述...',
      type: 'text',
      required: true
    },
    {
      key: 'home.projects.project3.category',
      label: '项目3类别',
      description: '第三个展示项目的类别',
      placeholder: '输入项目3类别...',
      type: 'text',
      required: true
    },
    {
      key: 'home.recommended.title',
      label: '推荐产品标题',
      description: '推荐产品部分的标题',
      placeholder: '输入推荐产品标题...',
      type: 'text',
      required: true
    },
    {
      key: 'home.recommended.subtitle',
      label: '推荐产品副标题',
      description: '推荐产品部分的副标题',
      placeholder: '输入推荐产品副标题...',
      type: 'textarea',
      required: true
    },
    {
      key: 'home.recommended.viewAll',
      label: '查看全部按钮',
      description: '推荐产品部分的查看全部按钮',
      placeholder: '输入查看全部按钮文本...',
      type: 'text',
      required: true
    },
    {
      key: 'home.featured.title',
      label: '精选产品标题',
      description: '精选产品部分的标题',
      placeholder: '输入精选产品标题...',
      type: 'text',
      required: true
    },
    {
      key: 'home.featured.subtitle',
      label: '精选产品副标题',
      description: '精选产品部分的副标题',
      placeholder: '输入精选产品副标题...',
      type: 'textarea',
      required: true
    },
    {
      key: 'home.reviews.title',
      label: '客户评价标题',
      description: '客户评价部分的标题',
      placeholder: '输入客户评价标题...',
      type: 'text',
      required: true
    },
    {
      key: 'home.reviews.subtitle',
      label: '客户评价副标题',
      description: '客户评价部分的副标题',
      placeholder: '输入客户评价副标题...',
      type: 'textarea',
      required: true
    },
    {
      key: 'home.reviews.quote1',
      label: '客户评价1',
      description: '第一个客户评价的内容',
      placeholder: '输入客户评价1内容...',
      type: 'textarea',
      required: true
    },
    {
      key: 'home.reviews.author1',
      label: '客户评价1作者',
      description: '第一个客户评价的作者姓名',
      placeholder: '输入客户评价1作者...',
      type: 'text',
      required: true
    },
    {
      key: 'home.reviews.position1',
      label: '客户评价1职位',
      description: '第一个客户评价作者的职位',
      placeholder: '输入客户评价1职位...',
      type: 'text',
      required: true
    },
    {
      key: 'home.reviews.company1',
      label: '客户评价1公司',
      description: '第一个客户评价作者的公司',
      placeholder: '输入客户评价1公司...',
      type: 'text',
      required: true
    },
    {
      key: 'home.reviews.quote2',
      label: '客户评价2',
      description: '第二个客户评价的内容',
      placeholder: '输入客户评价2内容...',
      type: 'textarea',
      required: true
    },
    {
      key: 'home.reviews.author2',
      label: '客户评价2作者',
      description: '第二个客户评价的作者姓名',
      placeholder: '输入客户评价2作者...',
      type: 'text',
      required: true
    },
    {
      key: 'home.reviews.position2',
      label: '客户评价2职位',
      description: '第二个客户评价作者的职位',
      placeholder: '输入客户评价2职位...',
      type: 'text',
      required: true
    },
    {
      key: 'home.reviews.company2',
      label: '客户评价2公司',
      description: '第二个客户评价作者的公司',
      placeholder: '输入客户评价2公司...',
      type: 'text',
      required: true
    },
    {
      key: 'home.reviews.quote3',
      label: '客户评价3',
      description: '第三个客户评价的内容',
      placeholder: '输入客户评价3内容...',
      type: 'textarea',
      required: true
    },
    {
      key: 'home.reviews.author3',
      label: '客户评价3作者',
      description: '第三个客户评价的作者姓名',
      placeholder: '输入客户评价3作者...',
      type: 'text',
      required: true
    },
    {
      key: 'home.reviews.position3',
      label: '客户评价3职位',
      description: '第三个客户评价作者的职位',
      placeholder: '输入客户评价3职位...',
      type: 'text',
      required: true
    },
    {
      key: 'home.reviews.company3',
      label: '客户评价3公司',
      description: '第三个客户评价作者的公司',
      placeholder: '输入客户评价3公司...',
      type: 'text',
      required: true
    },
    {
      key: 'home.partners.title',
      label: '合作伙伴标题',
      description: '合作伙伴部分的标题',
      placeholder: '输入合作伙伴标题...',
      type: 'text',
      required: true
    },
    {
      key: 'home.partners.desc',
      label: '合作伙伴描述',
      description: '合作伙伴部分的描述',
      placeholder: '输入合作伙伴描述...',
      type: 'textarea',
      required: true
    }
  ],
  about: [
    {
      key: 'about.title',
      label: '关于页面标题',
      description: '出现在关于页面顶部的主标题',
      placeholder: '输入关于页面标题...',
      type: 'text',
      required: true
    },
    {
      key: 'about.hero.title',
      label: '关于英雄区标题',
      description: '关于页面英雄区域的主标题',
      placeholder: '输入关于英雄区标题...',
      type: 'text',
      required: true
    },
    {
      key: 'about.hero.subtitle',
      label: '关于英雄区副标题',
      description: '关于页面英雄区域的副标题',
      placeholder: '输入关于英雄区副标题...',
      type: 'textarea',
      required: true
    },
    {
      key: 'about.mission.title',
      label: '使命标题',
      description: '使命部分的标题',
      placeholder: '输入使命标题...',
      type: 'text',
      required: true
    },
    {
      key: 'home.mission.title',
      label: '使命宣言标题',
      description: '使命宣言部分的标题',
      placeholder: '输入使命宣言标题...',
      type: 'text',
      required: true
    },
    {
      key: 'home.mission.content',
      label: '使命宣言内容',
      description: '公司使命宣言的所有段落内容（用换行符分隔段落）',
      placeholder: '输入第一段内容...\n\n输入第二段内容...\n\n可以继续添加更多段落...',
      type: 'long-text',
      required: true
    },

    {
      key: 'about.value.quality',
      label: '质量价值标题',
      description: '质量价值框的标题',
      placeholder: '输入质量价值标题...',
      type: 'text',
      required: true
    },
    {
      key: 'about.value.quality.desc',
      label: '质量价值描述',
      description: '质量价值框的描述',
      placeholder: '输入质量价值描述...',
      type: 'textarea',
      required: true
    },
    {
      key: 'about.value.innovation',
      label: '创新价值标题',
      description: '创新价值框的标题',
      placeholder: '输入创新价值标题...',
      type: 'text',
      required: true
    },
    {
      key: 'about.value.innovation.desc',
      label: '创新价值描述',
      description: '创新价值框的描述',
      placeholder: '输入创新价值描述...',
      type: 'textarea',
      required: true
    },
    {
      key: 'about.value.sustainability',
      label: '可持续性价值标题',
      description: '可持续性价值框的标题',
      placeholder: '输入可持续性价值标题...',
      type: 'text',
      required: true
    },
    {
      key: 'about.value.sustainability.desc',
      label: '可持续性价值描述',
      description: '可持续性价值框的描述',
      placeholder: '输入可持续性价值描述...',
      type: 'textarea',
      required: true
    },
    {
      key: 'about.timeline.title',
      label: '历程标题',
      description: '公司历程部分的标题',
      placeholder: '输入历程标题...',
      type: 'text',
      required: true
    },
    {
      key: 'about.timeline.2008.1',
      label: '2008年时间线事件1',
      description: '2008年时间线中的第一个事件',
      placeholder: '输入2008年事件1...',
      type: 'text',
      required: true
    },
    {
      key: 'about.timeline.2009.1',
      label: '2009年时间线事件1',
      description: '2009年时间线中的第一个事件',
      placeholder: '输入2009年事件1...',
      type: 'text',
      required: true
    },
    {
      key: 'about.timeline.2009.2',
      label: '2009年时间线事件2',
      description: '2009年时间线中的第二个事件',
      placeholder: '输入2009年事件2...',
      type: 'text',
      required: true
    },
    {
      key: 'about.timeline.2009.3',
      label: '2009年时间线事件3',
      description: '2009年时间线中的第三个事件',
      placeholder: '输入2009年事件3...',
      type: 'text',
      required: true
    },
    {
      key: 'about.timeline.2009.4',
      label: '2009年时间线事件4',
      description: '2009年时间线中的第四个事件',
      placeholder: '输入2009年事件4...',
      type: 'text',
      required: true
    },
    {
      key: 'about.timeline.2011.1',
      label: '2011年时间线事件1',
      description: '2011年时间线中的第一个事件',
      placeholder: '输入2011年事件1...',
      type: 'text',
      required: true
    },
    {
      key: 'about.timeline.2013.1',
      label: '2013年时间线事件1',
      description: '2013年时间线中的第一个事件',
      placeholder: '输入2013年事件1...',
      type: 'text',
      required: true
    },
    {
      key: 'about.timeline.2014.1',
      label: '2014年时间线事件1',
      description: '2014年时间线中的第一个事件',
      placeholder: '输入2014年事件1...',
      type: 'text',
      required: true
    },
    {
      key: 'about.timeline.2015.1',
      label: '2015年时间线事件1',
      description: '2015年时间线中的第一个事件',
      placeholder: '输入2015年事件1...',
      type: 'text',
      required: true
    },
    {
      key: 'about.timeline.2017.1',
      label: '2017年时间线事件1',
      description: '2017年时间线中的第一个事件',
      placeholder: '输入2017年事件1...',
      type: 'text',
      required: true
    },
    {
      key: 'about.timeline.2018.1',
      label: '2018年时间线事件1',
      description: '2018年时间线中的第一个事件',
      placeholder: '输入2018年事件1...',
      type: 'text',
      required: true
    },
    {
      key: 'about.ctaTitle',
      label: '行动号召标题',
      description: '行动号召部分的标题',
      placeholder: '输入行动号召标题...',
      type: 'text',
      required: true
    },
    {
      key: 'about.ctaDesc',
      label: '行动号召描述',
      description: '行动号召部分的描述',
      placeholder: '输入行动号召描述...',
      type: 'textarea',
      required: true
    },
    {
      key: 'about.ctaAbout',
      label: '观看公司视频按钮',
      description: '行动号召部分的观看公司视频按钮',
      placeholder: '输入观看公司视频按钮文本...',
      type: 'text',
      required: true
    },
    {
      key: 'about.ctaBrochure',
      label: '下载手册按钮',
      description: '行动号召部分的下载手册按钮',
      placeholder: '输入下载手册按钮文本...',
      type: 'text',
      required: true
    },
    {
      key: 'about.contactTitle',
      label: '联系标题',
      description: '联系部分的标题',
      placeholder: '输入联系标题...',
      type: 'text',
      required: true
    },
    {
      key: 'about.address',
      label: '地址标签',
      description: '地址信息的标签',
      placeholder: '输入地址标签...',
      type: 'text',
      required: true
    },
    {
      key: 'about.addressValue',
      label: '地址内容',
      description: '具体的地址信息',
      placeholder: '输入地址内容...',
      type: 'text',
      required: true
    },
    {
      key: 'about.email',
      label: '邮箱标签',
      description: '邮箱信息的标签',
      placeholder: '输入邮箱标签...',
      type: 'text',
      required: true
    },
    {
      key: 'about.phone',
      label: '电话标签',
      description: '电话信息的标签',
      placeholder: '输入电话标签...',
      type: 'text',
      required: true
    },
    {
      key: 'about.p5',
      label: '关于段落5',
      description: '描述公司的第五段',
      placeholder: '输入第五段关于内容...',
      type: 'long-text',
      required: true
    }
  ],
  products: [
    {
      key: 'products.title',
      label: '产品页面标题',
      description: '产品页面的主标题',
      placeholder: '输入产品页面标题...',
      type: 'text',
      required: true
    },
    {
      key: 'products.subtitle',
      label: '产品页面副标题',
      description: '产品页面的副标题',
      placeholder: '输入产品页面副标题...',
      type: 'textarea',
      required: true
    },
    {
      key: 'products.filter.title',
      label: '筛选器标题',
      description: '产品筛选部分的标题',
      placeholder: '输入筛选器标题...',
      type: 'text',
      required: true
    },
    {
      key: 'products.filter.search',
      label: '搜索占位符',
      description: '产品搜索框的占位符文本',
      placeholder: '输入搜索占位符...',
      type: 'text',
      required: true
    },
    {
      key: 'products.filters.all',
      label: '所有类别过滤器',
      description: '产品过滤器中的"所有类别"选项',
      placeholder: '输入所有类别文本...',
      type: 'text',
      required: true
    },
    {
      key: 'products.filters.waterproofing',
      label: '防水过滤器',
      description: '产品过滤器中的防水类别',
      placeholder: '输入防水类别文本...',
      type: 'text',
      required: true
    },
    {
      key: 'products.filters.sealants',
      label: '密封剂过滤器',
      description: '产品过滤器中的密封剂类别',
      placeholder: '输入密封剂类别文本...',
      type: 'text',
      required: true
    },
    {
      key: 'products.filters.flooring',
      label: '地板过滤器',
      description: '产品过滤器中的地板类别',
      placeholder: '输入地板类别文本...',
      type: 'text',
      required: true
    },
    {
      key: 'products.filters.grout',
      label: '灌浆过滤器',
      description: '产品过滤器中的灌浆类别',
      placeholder: '输入灌浆类别文本...',
      type: 'text',
      required: true
    },
    {
      key: 'products.filters.insulation',
      label: '隔热过滤器',
      description: '产品过滤器中的隔热类别',
      placeholder: '输入隔热类别文本...',
      type: 'text',
      required: true
    },
    {
      key: 'products.search.placeholder',
      label: '产品搜索占位符',
      description: '产品搜索框的占位符文本',
      placeholder: '输入产品搜索占位符...',
      type: 'text',
      required: true
    },
    {
      key: 'products.viewDetails',
      label: '查看详情按钮',
      description: '产品卡片上的查看详情按钮',
      placeholder: '输入查看详情按钮文本...',
      type: 'text',
      required: true
    },
    {
      key: 'products.specifications',
      label: '规格标签',
      description: '产品详情页的规格标签',
      placeholder: '输入规格标签文本...',
      type: 'text',
      required: true
    },
    {
      key: 'products.features',
      label: '特性标签',
      description: '产品详情页的特性标签',
      placeholder: '输入特性标签文本...',
      type: 'text',
      required: true
    },
    {
      key: 'products.applications',
      label: '应用标签',
      description: '产品详情页的应用标签',
      placeholder: '输入应用标签文本...',
      type: 'text',
      required: true
    },
    {
      key: 'products.downloads',
      label: '下载标签',
      description: '产品详情页的下载标签',
      placeholder: '输入下载标签文本...',
      type: 'text',
      required: true
    },
    {
      key: 'products.showing',
      label: '显示产品计数',
      description: '产品列表的显示计数文本',
      placeholder: '输入显示计数文本...',
      type: 'text',
      required: true
    },
    {
      key: 'products.filtered',
      label: '已过滤文本',
      description: '产品过滤状态的文本',
      placeholder: '输入已过滤文本...',
      type: 'text',
      required: true
    },
    {
      key: 'products.total',
      label: '总计文本',
      description: '产品总数的文本',
      placeholder: '输入总计文本...',
      type: 'text',
      required: true
    },
    {
      key: 'products.page',
      label: '页码标签',
      description: '分页中的页码标签',
      placeholder: '输入页码标签...',
      type: 'text',
      required: true
    },
    {
      key: 'products.of',
      label: '分页分隔符',
      description: '分页中的"of"分隔符',
      placeholder: '输入分页分隔符...',
      type: 'text',
      required: true
    }
  ],
  projects: [
    {
      key: 'projects.title',
      label: '项目页面标题',
      description: '项目页面的主标题',
      placeholder: '输入项目页面标题...',
      type: 'text',
      required: true
    },
    {
      key: 'projects.subtitle',
      label: '项目页面副标题',
      description: '项目页面的副标题',
      placeholder: '输入项目页面副标题...',
      type: 'textarea',
      required: true
    },
    {
      key: 'projects.intro',
      label: '项目介绍',
      description: '项目页面的介绍文本',
      placeholder: '输入项目介绍文本...',
      type: 'textarea',
      required: true
    },
    {
      key: 'projects.viewDetails',
      label: '查看项目详情按钮',
      description: '项目卡片上的查看详情按钮',
      placeholder: '输入查看项目详情按钮文本...',
      type: 'text',
      required: true
    },
    {
      key: 'projects.category',
      label: '类别标签',
      description: '项目详情页的类别标签',
      placeholder: '输入类别标签文本...',
      type: 'text',
      required: true
    },
    {
      key: 'projects.location',
      label: '位置标签',
      description: '项目详情页的位置标签',
      placeholder: '输入位置标签文本...',
      type: 'text',
      required: true
    },
    {
      key: 'projects.completion',
      label: '完成日期标签',
      description: '项目详情页的完成日期标签',
      placeholder: '输入完成日期标签文本...',
      type: 'text',
      required: true
    },
    {
      key: 'projects.client',
      label: '客户标签',
      description: '项目详情页的客户标签',
      placeholder: '输入客户标签文本...',
      type: 'text',
      required: true
    }
  ],
  articles: [
    {
      key: 'articles.title',
      label: '文章页面标题',
      description: '文章页面的主标题',
      placeholder: '输入文章页面标题...',
      type: 'text',
      required: true
    },
    {
      key: 'articles.subtitle',
      label: '文章页面副标题',
      description: '文章页面的副标题',
      placeholder: '输入文章页面副标题...',
      type: 'textarea',
      required: true
    },
    {
      key: 'articles.filters.all',
      label: '所有文章过滤器',
      description: '文章过滤器中的"所有文章"选项',
      placeholder: '输入所有文章文本...',
      type: 'text',
      required: true
    },
    {
      key: 'articles.filters.search_placeholder',
      label: '文章搜索占位符',
      description: '文章搜索框的占位符文本',
      placeholder: '输入文章搜索占位符...',
      type: 'text',
      required: true
    },
    {
      key: 'articles.readMore',
      label: '阅读更多按钮',
      description: '文章卡片上的阅读更多按钮',
      placeholder: '输入阅读更多按钮文本...',
      type: 'text',
      required: true
    },
    {
      key: 'articles.publishedOn',
      label: '发布日期标签',
      description: '文章详情页的发布日期标签',
      placeholder: '输入发布日期标签文本...',
      type: 'text',
      required: true
    },
    {
      key: 'articles.categories.technical_guides',
      label: '技术指南类别',
      description: '文章分类中的技术指南类别',
      placeholder: '输入技术指南类别文本...',
      type: 'text',
      required: true
    },
    {
      key: 'articles.categories.industry_news',
      label: '行业新闻类别',
      description: '文章分类中的行业新闻类别',
      placeholder: '输入行业新闻类别文本...',
      type: 'text',
      required: true
    },
    {
      key: 'articles.categories.case_studies',
      label: '案例研究类别',
      description: '文章分类中的案例研究类别',
      placeholder: '输入案例研究类别文本...',
      type: 'text',
      required: true
    },
    {
      key: 'articles.categories.product_updates',
      label: '产品更新类别',
      description: '文章分类中的产品更新类别',
      placeholder: '输入产品更新类别文本...',
      type: 'text',
      required: true
    },
    {
      key: 'articles.categories.company_news',
      label: '公司新闻类别',
      description: '文章分类中的公司新闻类别',
      placeholder: '输入公司新闻类别文本...',
      type: 'text',
      required: true
    }
  ],
  contact: [
    {
      key: 'contact.title',
      label: '联系页面标题',
      description: '联系页面的主标题',
      placeholder: '输入联系页面标题...',
      type: 'text',
      required: true
    },
    {
      key: 'contact.subtitle',
      label: '联系页面副标题',
      description: '联系页面的副标题',
      placeholder: '输入联系页面副标题...',
      type: 'textarea',
      required: true
    },
    {
      key: 'contact.form.name',
      label: '姓名标签',
      description: '联系表单中姓名字段的标签',
      placeholder: '输入姓名标签...',
      type: 'text',
      required: true
    },
    {
      key: 'contact.form.email',
      label: '邮箱标签',
      description: '联系表单中邮箱字段的标签',
      placeholder: '输入邮箱标签...',
      type: 'text',
      required: true
    },
    {
      key: 'contact.form.message',
      label: '消息标签',
      description: '联系表单中消息字段的标签',
      placeholder: '输入消息标签...',
      type: 'text',
      required: true
    },
    {
      key: 'contact.form.submit',
      label: '提交按钮',
      description: '联系表单提交按钮的文本',
      placeholder: '输入提交按钮文本...',
      type: 'text',
      required: true
    },
    {
      key: 'contact.info.title',
      label: '联系信息标题',
      description: '联系信息部分的标题',
      placeholder: '输入联系信息标题...',
      type: 'text',
      required: true
    },
    {
      key: 'contact.info.address',
      label: '地址标签',
      description: '联系信息中的地址标签',
      placeholder: '输入地址标签...',
      type: 'text',
      required: true
    },
    {
      key: 'contact.info.phone',
      label: '电话标签',
      description: '联系信息中的电话标签',
      placeholder: '输入电话标签...',
      type: 'text',
      required: true
    },
    {
      key: 'contact.info.email',
      label: '邮箱标签',
      description: '联系信息中的邮箱标签',
      placeholder: '输入邮箱标签...',
      type: 'text',
      required: true
    },
    {
      key: 'contact.info.hours',
      label: '营业时间标签',
      description: '联系信息中的营业时间标签',
      placeholder: '输入营业时间标签...',
      type: 'text',
      required: true
    },
    {
      key: 'contact.location.title',
      label: '位置标题',
      description: '位置部分的标题',
      placeholder: '输入位置标题...',
      type: 'text',
      required: true
    },
    {
      key: 'contact.location.placeholder',
      label: '位置占位符',
      description: '位置部分的占位符文本',
      placeholder: '输入位置占位符...',
      type: 'text',
      required: true
    },
    {
      key: 'contact.form.firstName',
      label: '名字标签',
      description: '联系表单中名字字段的标签',
      placeholder: '输入名字标签...',
      type: 'text',
      required: true
    },
    {
      key: 'contact.form.firstName.placeholder',
      label: '名字占位符',
      description: '联系表单中名字字段的占位符',
      placeholder: '输入名字占位符...',
      type: 'text',
      required: true
    },
    {
      key: 'contact.form.lastName',
      label: '姓氏标签',
      description: '联系表单中姓氏字段的标签',
      placeholder: '输入姓氏标签...',
      type: 'text',
      required: true
    },
    {
      key: 'contact.form.lastName.placeholder',
      label: '姓氏占位符',
      description: '联系表单中姓氏字段的占位符',
      placeholder: '输入姓氏占位符...',
      type: 'text',
      required: true
    },
    {
      key: 'contact.form.company',
      label: '公司标签',
      description: '联系表单中公司字段的标签',
      placeholder: '输入公司标签...',
      type: 'text',
      required: true
    },
    {
      key: 'contact.form.company.placeholder',
      label: '公司占位符',
      description: '联系表单中公司字段的占位符',
      placeholder: '输入公司占位符...',
      type: 'text',
      required: true
    },
    {
      key: 'contact.form.email.placeholder',
      label: '邮箱占位符',
      description: '联系表单中邮箱字段的占位符',
      placeholder: '输入邮箱占位符...',
      type: 'text',
      required: true
    },
    {
      key: 'contact.form.phone',
      label: '电话标签',
      description: '联系表单中电话字段的标签',
      placeholder: '输入电话标签...',
      type: 'text',
      required: true
    },
    {
      key: 'contact.form.phone.placeholder',
      label: '电话占位符',
      description: '联系表单中电话字段的占位符',
      placeholder: '输入电话占位符...',
      type: 'text',
      required: true
    },
    {
      key: 'contact.form.subject',
      label: '主题标签',
      description: '联系表单中主题字段的标签',
      placeholder: '输入主题标签...',
      type: 'text',
      required: true
    },
    {
      key: 'contact.form.subject.placeholder',
      label: '主题占位符',
      description: '联系表单中主题字段的占位符',
      placeholder: '输入主题占位符...',
      type: 'text',
      required: true
    },
    {
      key: 'contact.form.message.placeholder',
      label: '消息占位符',
      description: '联系表单中消息字段的占位符',
      placeholder: '输入消息占位符...',
      type: 'text',
      required: true
    }
  ],
  footer: [
    {
      key: 'footer.relatedPlatforms',
      label: '相关平台标题',
      description: '页脚中相关平台部分的标题',
      placeholder: '输入相关平台标题...',
      type: 'text',
      required: true
    },
    {
      key: 'footer.rlaPolymers',
      label: 'RLA聚合物链接',
      description: '页脚中RLA聚合物平台的链接文本',
      placeholder: '输入RLA聚合物链接文本...',
      type: 'text',
      required: true
    },
    {
      key: 'footer.ccMagazine',
      label: 'CC杂志链接',
      description: '页脚中CC杂志平台的链接文本',
      placeholder: '输入CC杂志链接文本...',
      type: 'text',
      required: true
    },
    {
      key: 'footer.contactUs',
      label: '联系我们标题',
      description: '页脚中联系我们部分的标题',
      placeholder: '输入联系我们标题...',
      type: 'text',
      required: true
    },
    {
      key: 'footer.phone',
      label: '电话标签',
      description: '页脚中电话信息的标签',
      placeholder: '输入电话标签...',
      type: 'text',
      required: true
    },
    {
      key: 'footer.hours',
      label: '营业时间标签',
      description: '页脚中营业时间的标签',
      placeholder: '输入营业时间标签...',
      type: 'text',
      required: true
    },
    {
      key: 'footer.address',
      label: '地址标签',
      description: '页脚中地址信息的标签',
      placeholder: '输入地址标签...',
      type: 'text',
      required: true
    },
    {
      key: 'footer.addressValue',
      label: '地址内容',
      description: '页脚中显示的具体地址',
      placeholder: '输入具体地址...',
      type: 'text',
      required: true
    },
    {
      key: 'footer.email',
      label: '邮箱标签',
      description: '页脚中邮箱信息的标签',
      placeholder: '输入邮箱标签...',
      type: 'text',
      required: true
    },
    {
      key: 'footer.otherPlatforms',
      label: '其他平台标题',
      description: '页脚中其他平台部分的标题',
      placeholder: '输入其他平台标题...',
      type: 'text',
      required: true
    },
    {
      key: 'footer.rightsReserved',
      label: '版权声明',
      description: '页脚中显示的版权声明',
      placeholder: '输入版权声明...',
      type: 'text',
      required: true
    }
  ],
  common: [
    {
      key: 'ui.viewMore',
      label: '查看更多按钮',
      description: '整个网站中"查看更多"按钮的文本',
      placeholder: '输入查看更多按钮文本...',
      type: 'text',
      required: true
    },
    {
      key: 'ui.backToProducts',
      label: '返回产品按钮',
      description: '"返回产品"按钮的文本',
      placeholder: '输入返回产品按钮文本...',
      type: 'text',
      required: true
    },
    {
      key: 'ui.contactUs',
      label: '联系我们按钮',
      description: '整个网站中"联系我们"按钮的文本',
      placeholder: '输入联系我们按钮文本...',
      type: 'text',
      required: true
    },
    {
      key: 'ui.viewSpecs',
      label: '查看规格按钮',
      description: '"查看规格"按钮的文本',
      placeholder: '输入查看规格按钮文本...',
      type: 'text',
      required: true
    },
    {
      key: 'ui.relatedProducts',
      label: '相关产品标题',
      description: '相关产品部分的标题',
      placeholder: '输入相关产品标题...',
      type: 'text',
      required: true
    },
    {
      key: 'ui.loadingRelatedProducts',
      label: '加载相关产品',
      description: '加载相关产品时显示的文本',
      placeholder: '输入加载文本...',
      type: 'text',
      required: true
    },
    {
      key: 'ui.selectRelatedProducts',
      label: '选择相关产品',
      description: '相关产品选择界面的文本',
      placeholder: '输入选择相关产品文本...',
      type: 'text',
      required: true
    }
  ],
  guide: [
    {
      key: 'guide.title',
      label: '指南页面标题',
      description: '指南页面的主标题',
      placeholder: '输入指南页面标题...',
      type: 'text',
      required: true
    },
    {
      key: 'guide.subtitle',
      label: '指南页面副标题',
      description: '指南页面的副标题描述',
      placeholder: '输入指南页面副标题...',
      type: 'textarea',
      required: true
    },
    {
      key: 'guide.selectFacility',
      label: '选择设施类型',
      description: '选择设施类型的提示文本',
      placeholder: '输入选择设施类型文本...',
      type: 'text',
      required: true
    },
    {
      key: 'guide.facilityType1.name',
      label: '设施类型1名称',
      description: '第一种设施类型的名称',
      placeholder: '输入设施类型1名称...',
      type: 'text',
      required: true
    },
    {
      key: 'guide.facilityType1.description',
      label: '设施类型1描述',
      description: '第一种设施类型的描述',
      placeholder: '输入设施类型1描述...',
      type: 'textarea',
      required: true
    },
    {
      key: 'guide.facilityType2.name',
      label: '设施类型2名称',
      description: '第二种设施类型的名称',
      placeholder: '输入设施类型2名称...',
      type: 'text',
      required: true
    },
    {
      key: 'guide.facilityType2.description',
      label: '设施类型2描述',
      description: '第二种设施类型的描述',
      placeholder: '输入设施类型2描述...',
      type: 'textarea',
      required: true
    },
    {
      key: 'guide.facilityType3.name',
      label: '设施类型3名称',
      description: '第三种设施类型的名称',
      placeholder: '输入设施类型3名称...',
      type: 'text',
      required: true
    },
    {
      key: 'guide.facilityType3.description',
      label: '设施类型3描述',
      description: '第三种设施类型的描述',
      placeholder: '输入设施类型3描述...',
      type: 'textarea',
      required: true
    },
    {
      key: 'guide.facilityType4.name',
      label: '设施类型4名称',
      description: '第四种设施类型的名称',
      placeholder: '输入设施类型4名称...',
      type: 'text',
      required: true
    },
    {
      key: 'guide.facilityType4.description',
      label: '设施类型4描述',
      description: '第四种设施类型的描述',
      placeholder: '输入设施类型4描述...',
      type: 'textarea',
      required: true
    },
    {
      key: 'guide.facilityType5.name',
      label: '设施类型5名称',
      description: '第五种设施类型的名称',
      placeholder: '输入设施类型5名称...',
      type: 'text',
      required: true
    },
    {
      key: 'guide.facilityType5.description',
      label: '设施类型5描述',
      description: '第五种设施类型的描述',
      placeholder: '输入设施类型5描述...',
      type: 'textarea',
      required: true
    },
    {
      key: 'guide.facilityType6.name',
      label: '设施类型6名称',
      description: '第六种设施类型的名称',
      placeholder: '输入设施类型6名称...',
      type: 'text',
      required: true
    },
    {
      key: 'guide.facilityType6.description',
      label: '设施类型6描述',
      description: '第六种设施类型的描述',
      placeholder: '输入设施类型6描述...',
      type: 'textarea',
      required: true
    },
    {
      key: 'guide.facilityType7.name',
      label: '设施类型7名称',
      description: '第七种设施类型的名称',
      placeholder: '输入设施类型7名称...',
      type: 'text',
      required: true
    },
    {
      key: 'guide.facilityType7.description',
      label: '设施类型7描述',
      description: '第七种设施类型的描述',
      placeholder: '输入设施类型7描述...',
      type: 'textarea',
      required: true
    }
  ],
  notFound: [
    {
      key: 'notFound.title',
      label: '404页面标题',
      description: '404页面的主标题',
      placeholder: '输入404页面标题...',
      type: 'text',
      required: true
    },
    {
      key: 'notFound.subtitle',
      label: '404页面副标题',
      description: '404页面的副标题',
      placeholder: '输入404页面副标题...',
      type: 'text',
      required: true
    },
    {
      key: 'notFound.home',
      label: '返回首页链接',
      description: '404页面中返回首页的链接文本',
      placeholder: '输入返回首页链接文本...',
      type: 'text',
      required: true
    }
  ]
};

function WebsiteTextEditor() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [texts, setTexts] = useState<WebsiteText[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('zh-Hant');
  const [activeTab, setActiveTab] = useState('navigation');
  const [highlightedKey, setHighlightedKey] = useState<string | null>(null);
  const [shouldScrollToSection, setShouldScrollToSection] = useState(false);

  const SECTIONS = [
    { 
      id: 'navigation', 
      name: t('admin.websiteText.navigation'), 
      icon: <FileText className="h-5 w-5" />,
      description: t('admin.websiteText.navigationDesc')
    },
    { 
      id: 'home', 
      name: t('admin.websiteText.home'), 
      icon: <Home className="h-5 w-5" />,
      description: t('admin.websiteText.homeDesc')
    },
    { 
      id: 'about', 
      name: t('admin.websiteText.about'), 
      icon: <Users className="h-5 w-5" />,
      description: t('admin.websiteText.aboutDesc')
    },
    { 
      id: 'products', 
      name: t('admin.websiteText.products'), 
      icon: <Package className="h-5 w-5" />,
      description: t('admin.websiteText.productsDesc')
    },
    { 
      id: 'projects', 
      name: t('admin.websiteText.projects'), 
      icon: <Building className="h-5 w-5" />,
      description: t('admin.websiteText.projectsDesc')
    },
    { 
      id: 'articles', 
      name: t('admin.websiteText.articles'), 
      icon: <Newspaper className="h-5 w-5" />,
      description: t('admin.websiteText.articlesDesc')
    },
    { 
      id: 'contact', 
      name: t('admin.websiteText.contact'), 
      icon: <Phone className="h-5 w-5" />,
      description: t('admin.websiteText.contactDesc')
    },
    { 
      id: 'footer', 
      name: t('admin.websiteText.footer'), 
      icon: <FileText className="h-5 w-5" />,
      description: t('admin.websiteText.footerDesc')
    },
    { 
      id: 'common', 
      name: t('admin.websiteText.common'), 
      icon: <Settings className="h-5 w-5" />,
      description: t('admin.websiteText.commonDesc')
    },
    { 
      id: 'media', 
      name: t('admin.websiteText.media'), 
      icon: <Image className="h-5 w-5" />,
      description: t('admin.websiteText.mediaDesc')
    },
    { 
      id: 'resources', 
      name: t('admin.websiteText.resources'), 
      icon: <BookOpen className="h-5 w-5" />,
      description: t('admin.websiteText.resourcesDesc')
    },
    { 
      id: 'guide', 
      name: t('admin.websiteText.guide'), 
      icon: <BookOpen className="h-5 w-5" />,
      description: t('admin.websiteText.guideDesc')
    },
    { 
      id: 'notFound', 
      name: t('admin.websiteText.notFound'), 
      icon: <AlertTriangle className="h-5 w-5" />,
      description: t('admin.websiteText.notFoundDesc')
    }
  ];

  // Get parameters from URL
  useEffect(() => {
    const langParam = searchParams.get('language');
    const keyParam = searchParams.get('key');
    const sectionParam = searchParams.get('section');
    const highlightParam = searchParams.get('highlight');
    
    console.log('URL Parameters:', { langParam, keyParam, sectionParam, highlightParam });
    
    if (langParam && LANGUAGES.some(l => l.code === langParam)) {
      setSelectedLanguage(langParam as Language);
      console.log('Set language to:', langParam);
    }
    
    if (keyParam) {
      // Extract section from key (e.g., 'nav' from 'nav.home')
      const section = keyParam.split('.')[0];
      console.log('Extracted section from key:', section);
      
      if (SECTIONS.some(s => s.id === section)) {
        setActiveTab(section);
        console.log('Set active tab to:', section);
      } else {
        console.warn('Section not found:', section);
      }
      
      // Set highlighted key if highlight parameter is true
      if (highlightParam === 'true') {
        setHighlightedKey(keyParam);
        setShouldScrollToSection(true);
        console.log('Set highlighted key to:', keyParam);
      }
    }
    
    // If section parameter is provided, use it (override key-based section)
    if (sectionParam && SECTIONS.some(s => s.id === sectionParam)) {
      setActiveTab(sectionParam);
      console.log('Set active tab from section param to:', sectionParam);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchTexts();
  }, []);

  // Initialize empty fields when language changes
  useEffect(() => {
    if (texts.length > 0) {
      initializeEmptyFields();
    }
  }, [selectedLanguage, texts.length]);

  // Handle scrolling to highlighted section
  useEffect(() => {
    if (shouldScrollToSection && highlightedKey && !loading) {
      console.log('Attempting to scroll to highlighted key:', highlightedKey);
      console.log('Active tab:', activeTab);
      
      // Wait for the tab to be active and content to be rendered
      const timer = setTimeout(() => {
        const element = document.getElementById(`field-${highlightedKey}`);
        console.log('Looking for element with ID:', `field-${highlightedKey}`);
        console.log('Element found:', !!element);
        
        if (element) {
          // Ensure the element is visible by scrolling to it
          element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
          
          // Add highlight effect
          element.classList.add('ring-2', 'ring-blue-500', 'ring-opacity-50');
          
          // Remove highlight after 3 seconds
          setTimeout(() => {
            element.classList.remove('ring-2', 'ring-blue-500', 'ring-opacity-50');
            setHighlightedKey(null);
          }, 3000);
        } else {
          console.warn('Element not found for key:', highlightedKey);
          // Try to find any element with the key in its ID
          const allElements = document.querySelectorAll('[id*="' + highlightedKey + '"]');
          console.log('Elements with similar IDs:', allElements);
        }
        setShouldScrollToSection(false);
      }, 1000); // Increased delay to ensure tab content is rendered
      
      return () => clearTimeout(timer);
    }
  }, [shouldScrollToSection, highlightedKey, loading, activeTab]);

  const fetchTexts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('website_texts')
        .select('*')
        .order('key');

      if (error) {
        console.error('Error fetching texts:', error);
        toast.error("加载网站文本失败");
      } else {
        // Remove any duplicates from the database response
        const uniqueData = (data || []).reduce((acc, item) => {
          const existingIndex = acc.findIndex(t => t.key === item.key && t.language === item.language);
          if (existingIndex >= 0) {
            // Keep the most recent one (based on updated_at if available, otherwise keep the last one)
            if (item.updated_at && acc[existingIndex].updated_at) {
              if (new Date(item.updated_at) > new Date(acc[existingIndex].updated_at)) {
                acc[existingIndex] = item;
              }
            } else {
              acc[existingIndex] = item;
            }
          } else {
            acc.push(item);
          }
          return acc;
        }, [] as typeof data);

        if (uniqueData.length !== (data || []).length) {
          console.warn('Removed duplicates from database response:', (data || []).length - uniqueData.length);
        }

        setTexts(uniqueData);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error("加载网站文本失败");
    }
    setLoading(false);
  };

  const handleTextChange = (key: string, value: string) => {
    setTexts(prev => {
      // Check if text already exists for this key and language
      const existingTextIndex = prev.findIndex(text => 
        text.key === key && text.language === selectedLanguage
      );
      
      if (existingTextIndex >= 0) {
        // Update existing text
        return prev.map(text => 
          text.key === key && text.language === selectedLanguage 
            ? { ...text, value } 
            : text
        );
      } else {
        // Create new text entry
        const newText: WebsiteText = {
          key,
          value,
          language: selectedLanguage,
          section: key.split('.')[0] // Extract section from key (e.g., 'nav' from 'nav.home')
        };
        return [...prev, newText];
      }
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Only save texts that have content (not empty strings)
      const textsToSave = texts.filter(text => 
        text.language === selectedLanguage && 
        text.value && 
        text.value.trim().length > 0
      );
      
      // Debug: Check for duplicates in the original texts array
      const duplicateKeys = textsToSave
        .map(text => `${text.key}:${text.language}`)
        .filter((key, index, self) => self.indexOf(key) !== index);
      
      if (duplicateKeys.length > 0) {
        console.warn('Found duplicate keys in texts array:', duplicateKeys);
      }
      
      if (textsToSave.length === 0) {
        toast.info("没有内容需要保存");
        setSaving(false);
        return;
      }
      
      // Prepare data for upsert - only include the fields that exist in the database
      const dataToSave = textsToSave.map(text => ({
        key: text.key,
        value: text.value,
        language: text.language,
        section: text.section
      }));
      
      // Remove duplicates based on key and language combination, keeping the last occurrence
      const uniqueDataToSave = dataToSave.reduce((acc, item) => {
        const existingIndex = acc.findIndex(t => t.key === item.key && t.language === item.language);
        if (existingIndex >= 0) {
          // Replace existing entry with the new one (last occurrence wins)
          acc[existingIndex] = item;
        } else {
          acc.push(item);
        }
        return acc;
      }, [] as typeof dataToSave);
      
      if (uniqueDataToSave.length !== dataToSave.length) {
        console.warn('Duplicate entries removed:', dataToSave.length - uniqueDataToSave.length);
      }
      
      // Validate data before sending
      const invalidData = uniqueDataToSave.filter(item => 
        !item.key || !item.value || !item.language || !item.section
      );
      
      if (invalidData.length > 0) {
        console.error('Invalid data found:', invalidData);
        toast.error("数据验证失败：存在空字段");
        setSaving(false);
        return;
      }
      
      console.log('Attempting to save data:', uniqueDataToSave);
      
      const { error } = await supabase
        .from('website_texts')
        .upsert(uniqueDataToSave, { onConflict: 'key,language' });

      if (error) {
        console.error('Error saving texts:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        toast.error(`保存更改失败: ${error.message}`);
      } else {
        toast.success(`成功保存了 ${textsToSave.length} 个文本字段！`);
        
        // Update local state with the saved data instead of fetching from database
        setTexts(prev => {
          const updated = [...prev];
          uniqueDataToSave.forEach(savedItem => {
            const index = updated.findIndex(item => 
              item.key === savedItem.key && item.language === savedItem.language
            );
            if (index >= 0) {
              updated[index] = { ...updated[index], ...savedItem };
            } else {
              updated.push(savedItem as WebsiteText);
            }
          });
          return updated;
        });
        
        // Notify other components to refresh translations
        window.dispatchEvent(new CustomEvent('translationUpdate'));
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error("保存更改失败");
    }
    setSaving(false);
  };

  const getTextValue = (key: string) => {
    // First try to find text in selected language from database
    let text = texts.find(t => t.key === key && t.language === selectedLanguage);
    
    // If not found in database, try local translations
    if (!text) {
      const localTranslations = {
        'en': enTranslations,
        'ja': jaTranslations,
        'ko': koTranslations,
        'th': thTranslations,
        'vi': viTranslations,
        'zh-Hans': zhHansTranslations,
        'zh-Hant': zhHantTranslations,
      };
      
      const localValue = localTranslations[selectedLanguage]?.[key];
      if (localValue) {
        return localValue;
      }
    }
    
    // If not found and not Traditional Chinese, try Traditional Chinese as fallback
    if (!text && selectedLanguage !== 'zh-Hant') {
      text = texts.find(t => t.key === key && t.language === 'zh-Hant');
    }
    
    // If still not found, try English as final fallback
    if (!text) {
      text = texts.find(t => t.key === key && t.language === 'en');
    }
    
    return text?.value || '';
  };

  // Initialize empty fields for the current language when language changes
  const initializeEmptyFields = () => {
    const allFields = Object.values(TEXT_FIELDS).flat();
    const currentLanguageTexts = texts.filter(t => t.language === selectedLanguage);
    
    const localTranslations = {
      'en': enTranslations,
      'ja': jaTranslations,
      'ko': koTranslations,
      'th': thTranslations,
      'vi': viTranslations,
      'zh-Hans': zhHansTranslations,
      'zh-Hant': zhHantTranslations,
    };
    
    allFields.forEach(field => {
      const exists = currentLanguageTexts.some(t => t.key === field.key);
      if (!exists) {
        // Check if there's content in local translations
        const localValue = localTranslations[selectedLanguage]?.[field.key];
        
        // Create entry for this field in current language
        const newText: WebsiteText = {
          key: field.key,
          value: localValue || '',
          language: selectedLanguage,
          section: field.key.split('.')[0]
        };
        setTexts(prev => [...prev, newText]);
      }
    });
  };

  const renderTextField = (field: TextField) => {
    const value = getTextValue(field.key);
    const hasContent = value && value.trim().length > 0;
    const isHighlighted = highlightedKey === field.key;
    
    return (
      <div 
        id={`field-${field.key}`}
        key={field.key} 
        className={`space-y-2 p-4 rounded-lg border transition-all duration-300 ${
          hasContent ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
        } ${
          isHighlighted ? 'ring-2 ring-blue-500 ring-opacity-50 bg-blue-50' : ''
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <p className="text-xs text-muted-foreground mt-1">{field.description}</p>
          </div>
          <div className="flex items-center gap-2">
            {isHighlighted && (
              <Badge variant="default" className="text-xs bg-blue-500">
                高亮
              </Badge>
            )}
            <Badge variant={hasContent ? "default" : "secondary"} className="text-xs">
              {hasContent ? "有内容" : "空字段"}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {field.key}
            </Badge>
          </div>
        </div>
        
        {field.type === 'textarea' ? (
          <Textarea
            value={value}
            onChange={(e) => handleTextChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            className="min-h-[80px]"
          />
        ) : field.type === 'long-text' ? (
          <Textarea
            value={value}
            onChange={(e) => handleTextChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            className="min-h-[120px]"
          />
        ) : (
          <Input
            value={value}
            onChange={(e) => handleTextChange(field.key, e.target.value)}
            placeholder={field.placeholder}
          />
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-24">
        <div className="container mx-auto p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">正在加载文本编辑器...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-6">
        <div className="container mx-auto">
          <Link to="/admin/dashboard">
            <Button variant="secondary" className="mb-4 bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回仪表板
            </Button>
          </Link>
          
          <div>
            <h1 className="text-3xl font-bold">网站文本管理器</h1>
            <p className="text-primary-foreground/80">
              编辑您网站上的每一段文本。按页面和部分组织，便于管理。
            </p>
          </div>
        </div>
      </div>

      {/* Language Selection */}
      <div className="bg-background border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">选择编辑语言:</span>
            </div>
            <div className="flex gap-2">
              {LANGUAGES.map(lang => (
                <Button
                  key={lang.code}
                  variant={selectedLanguage === lang.code ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedLanguage(lang.code)}
                  className="flex items-center gap-2"
                >
                  <span>{lang.flag}</span>
                  <span>{lang.nativeName}</span>
                </Button>
              ))}
            </div>
            <Button onClick={handleSave} disabled={saving} size="sm">
              <Save className="mr-2 h-4 w-4" />
              {saving ? '保存中...' : '保存所有更改'}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-8">
        {/* Progress Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              翻译进度 - {LANGUAGES.find(l => l.code === selectedLanguage)?.nativeName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const allFields = Object.values(TEXT_FIELDS).flat();
              const currentLanguageTexts = texts.filter(t => t.language === selectedLanguage);
              const fieldsWithContent = allFields.filter(field => {
                const text = currentLanguageTexts.find(t => t.key === field.key);
                return text && text.value && text.value.trim().length > 0;
              });
              const progress = Math.round((fieldsWithContent.length / allFields.length) * 100);
              
              return (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">完成进度</span>
                    <span className="text-sm text-muted-foreground">
                      {fieldsWithContent.length} / {allFields.length} 字段
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>已完成: {fieldsWithContent.length}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                      <span>待完成: {allFields.length - fieldsWithContent.length}</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              如何使用此编辑器
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <p>从下拉菜单中选择语言来编辑该特定语言的文本</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <p>使用下面的标签在网站的不同部分之间导航</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <p>每个字段都包含描述，说明文本在您网站上的显示位置</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <p>绿色背景表示字段有内容，灰色背景表示空字段</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <p>点击"保存所有更改"以使用新文本更新您的网站</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="mt-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6 lg:grid-cols-12">
              {SECTIONS.map(section => (
                <TabsTrigger key={section.id} value={section.id} className="flex items-center gap-2">
                  {section.icon}
                  <span className="hidden lg:inline">{section.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {SECTIONS.map(section => (
              <TabsContent key={section.id} value={section.id} className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      {section.icon}
                      {section.name}
                    </CardTitle>
                    <p className="text-muted-foreground">{section.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {TEXT_FIELDS[section.id] ? (
                      TEXT_FIELDS[section.id].map(field => renderTextField(field))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">
                          此部分尚未定义文本字段。
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default WebsiteTextEditor; 