import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { headers } from "next/headers";

// Define API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

// Force dynamic rendering to ensure fresh metadata on each request
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({
  params
}: {
  params: any
}): Promise<Metadata> {
  // Access headers to ensure dynamic rendering
  headers();

  // Await params before accessing properties
  const resolvedParams = await Promise.resolve(params);
  const prayerId = resolvedParams.prayer_id;

  console.log(`Generating metadata for prayer: ${prayerId}`);

  let prayerTitle = "Prayer from In His Path";
  let prayerText = "A meaningful prayer for reflection and devotion.";
  let quoteImageUrl = `https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg/960px-Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg`;
  
  try {
    // Fetch the specific prayer
    const prayerRes = await fetch(`${API_BASE_URL}/prayers/${prayerId}`, { 
      cache: 'no-store'
    });
    
    if (prayerRes.ok) {
      const prayerData = await prayerRes.json();
      if (prayerData?.title) {
        prayerTitle = prayerData.title;
      }
      if (prayerData?.text) {
        // Replace newlines with spaces for the description
        prayerText = prayerData.text.replace(/\n/g, ' ');
      }
      
      // Set the dynamically generated quote image URL
      quoteImageUrl = `${API_BASE_URL}/prayers/${prayerId}/quote-image`;
    }
  } catch (error) {
    console.error("Failed to fetch prayer for metadata:", error);
  }

  // Create the page title in format "Prayer Title | In His Path"
  const title = `${prayerTitle} | In His Path`;
  
  // Build complete metadata object with prayer content as description
  return {
    title,
    description: prayerText,
    openGraph: {
      title,
      description: prayerText,
      type: "website",
      url: `https://beta.inhispath.com/prayer/${prayerId}`,
      siteName: "In His Path",
      images: [
        {
          url: quoteImageUrl,
          width: 1200,
          height: 630,
          alt: `${prayerTitle} - ${prayerText}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: prayerText,
      images: [quoteImageUrl],
    },
  };
}

export default async function PrayerPage({
  params
}: {
  params: any
}) {
  // Await params before accessing properties
  const resolvedParams = await Promise.resolve(params);
  const prayerId = resolvedParams.prayer_id;
  
  // Create the redirect URL
  const redirectUrl = `/prayers`;
  
  // Fetch prayer content for display
  let prayerTitle = "Prayer";
  let prayerText = "Loading prayer...";
  let quoteImageUrl = `https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg/960px-Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg`;
  
  try {
    // Fetch the specific prayer
    const prayerRes = await fetch(`${API_BASE_URL}/prayers/${prayerId}`, { 
      cache: 'no-store'
    });
    
    if (prayerRes.ok) {
      const prayerData = await prayerRes.json();
      if (prayerData?.title) {
        prayerTitle = prayerData.title;
      }
      if (prayerData?.text) {
        prayerText = prayerData.text;
      }
      
      // Set the dynamically generated quote image URL
      quoteImageUrl = `${API_BASE_URL}/prayers/${prayerId}/quote-image`;
    }
  } catch (error) {
    console.error("Error fetching prayer:", error);
  }

  // Prepare description with newlines replaced by spaces
  const prayerDescription = prayerText.replace(/\n/g, ' ');

  return (
    <html>
      <head>
        <meta property="og:title" content={`${prayerTitle} | In His Path`} />
        <meta property="og:description" content={prayerDescription} />
        <meta property="og:image" content={quoteImageUrl} />
        <meta property="og:url" content={`https://beta.inhispath.com/prayer/${prayerId}`} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="In His Path" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${prayerTitle} | In His Path`} />
        <meta name="twitter:description" content={prayerDescription} />
        <meta name="twitter:image" content={quoteImageUrl} />

        <title>{`${prayerTitle} | In His Path`}</title>
        <meta name="description" content={prayerDescription} />
      </head>
      <body style={{
        fontFamily: 'system-ui, -apple-system, sans-serif',
        width: '100%',
        margin: '0',
        padding: '0',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        textAlign: 'center',
        overflow: 'hidden'
      }}>
        <div style={{
          textAlign: 'center', 
          padding: '40px 20px',
          lineHeight: 1.6,
          color: '#333',
          maxWidth: '800px'
        }}>
          <h1 style={{ fontSize: '24px', marginBottom: '20px' }} className="font-primary text-[#333] font-[600]">{prayerTitle}</h1>
          <div style={{ 
            fontSize: '18px', 
            marginBottom: '30px',
            textAlign: 'center',
            whiteSpace: 'pre-line',
          }} className="font-primary text-[#333]">
            {prayerText}
          </div>
          <a href={redirectUrl} style={{
            display: 'inline-block',
            background: '#684242',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '8px',
            textDecoration: 'none',
            marginTop: '20px',
          }}>
            View All Prayers
          </a>
        </div>
      </body>
    </html>
  );
}