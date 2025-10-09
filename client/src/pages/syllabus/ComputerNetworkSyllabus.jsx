import React from 'react';
import SyllabusTemplate from '../../components/SyllabusTemplate';

const ComputerNetworkSyllabus = () => {
  const subjectData = {
    title: 'Computer Network',
    description: 'Complete theoretical and practical knowledge of computer networking concepts',
    content: (
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <h2>Computer Network Complete Syllabus</h2>
        <p className="lead">Master networking concepts from fundamentals to advanced implementations with practical examples</p>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg my-6">
          <h3 className="text-blue-800 dark:text-blue-200">🎯 Learning Objectives</h3>
          <ul className="list-disc list-inside">
            <li>Understand network architectures and protocols</li>
            <li>Implement and configure network devices</li>
            <li>Analyze and troubleshoot network issues</li>
            <li>Design secure network infrastructures</li>
          </ul>
        </div>

        <h3>📚 Beginner Level - Network Fundamentals</h3>
        
        <h4>1. Introduction to Networking</h4>
        <p><strong>Theory:</strong> Computer networks enable devices to communicate and share resources. Understanding basic concepts like nodes, links, and protocols forms the foundation of networking. Networks can be classified based on geographical coverage (LAN, MAN, WAN) and architecture (client-server, peer-to-peer).</p>
        <p><strong>Practical:</strong> Set up a simple LAN using switches and configure basic IP addresses. Use ping and traceroute commands to test connectivity between devices.</p>
        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded mt-2">
          <strong>Example:</strong> Create a home network with two computers and a router, assign static IP addresses, and test file sharing between devices.
        </div>

        <h4>2. Network Topologies</h4>
        <p><strong>Theory:</strong> Network topologies define the physical or logical arrangement of devices in a network. Common topologies include bus, star, ring, mesh, and hybrid configurations. Each topology has advantages in cost, scalability, and fault tolerance.</p>
        <p><strong>Practical:</strong> Use network simulation tools like Packet Tracer to create different topologies and analyze their performance characteristics under various traffic conditions.</p>
        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded mt-2">
          <strong>Example:</strong> Build a star topology in simulation software, add 10 devices, and measure performance when the central switch fails.
        </div>

        <h4>3. OSI and TCP/IP Models</h4>
        <p><strong>Theory:</strong> The OSI model has 7 layers (Physical, Data Link, Network, Transport, Session, Presentation, Application) while TCP/IP has 4 layers. These models standardize network communication and ensure interoperability between different vendors' equipment.</p>
        <p><strong>Practical:</strong> Use Wireshark to capture packets and analyze how different protocols operate at each layer of the TCP/IP model.</p>
        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded mt-2">
          <strong>Example:</strong> Capture HTTP traffic and identify the Ethernet header (Layer 2), IP header (Layer 3), TCP header (Layer 4), and HTTP data (Layer 7).
        </div>

        <h3>🎯 Intermediate Level - Protocol Implementation</h3>
        
        <h4>4. IP Addressing and Subnetting</h4>
        <p><strong>Theory:</strong> IP addresses uniquely identify devices on a network. IPv4 uses 32-bit addresses while IPv6 uses 128-bit addresses. Subnetting allows network segmentation for better management and security through CIDR notation and subnet masks.</p>
        <p><strong>Practical:</strong> Calculate subnet masks for various network requirements and configure routers with appropriate IP addressing schemes.</p>
        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded mt-2">
          <strong>Example:</strong> Given the network 192.168.1.0/24, create 8 subnets with 30 hosts each and configure the routing table.
        </div>

        <h4>5. Routing Protocols</h4>
        <p><strong>Theory:</strong> Routing protocols determine the best path for data packets. Distance-vector protocols (RIP) use hop count while link-state protocols (OSPF) use cost metrics. BGP handles routing between autonomous systems on the internet.</p>
        <p><strong>Practical:</strong> Configure OSPF and RIP on Cisco routers, observe route selection, and analyze routing tables for path determination.</p>
        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded mt-2">
          <strong>Example:</strong> Set up multiple routers with OSPF, intentionally break a link, and observe how the protocol recalculates routes.
        </div>

        <h4>6. Switching Concepts</h4>
        <p><strong>Theory:</strong> Switches operate at Layer 2 and use MAC addresses to forward frames. VLANs logically segment networks while STP prevents switching loops. Ethernet protocols define frame structure and collision handling mechanisms.</p>
        <p><strong>Practical:</strong> Configure VLANs on switches, set up trunk links, and implement inter-VLAN routing using layer 3 switches or routers.</p>
        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded mt-2">
          <strong>Example:</strong> Create VLANs for different departments, configure access ports, and test connectivity between VLANs.
        </div>

        <h3>🚀 Advanced Level - Network Security & Management</h3>
        
        <h4>7. Network Security</h4>
        <p><strong>Theory:</strong> Network security protects infrastructure from unauthorized access and attacks. Firewalls filter traffic, VPNs create secure tunnels, and encryption protocols like SSL/TLS protect data confidentiality. IDS/IPS systems detect and prevent intrusions.</p>
        <p><strong>Practical:</strong> Configure firewall rules, set up IPsec VPN tunnels, and implement access control lists on routers and switches.</p>
        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded mt-2">
          <strong>Example:</strong> Create firewall rules to allow only HTTP/HTTPS traffic while blocking other protocols, then test the configuration.
        </div>

        <h4>8. Wireless Networking</h4>
        <p><strong>Theory:</strong> Wireless networks use radio waves instead of cables. 802.11 standards define specifications for WLANs. Security protocols include WEP, WPA, and WPA2. Concepts like SSID, BSSID, and channels manage wireless communication.</p>
        <p><strong>Practical:</strong> Configure wireless access points, set up different security modes, and analyze wireless network performance using spectrum analyzers.</p>
        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded mt-2">
          <strong>Example:</strong> Set up a wireless network with WPA2 encryption, test connectivity, and measure signal strength at different distances.
        </div>

        <h4>9. Network Troubleshooting</h4>
        <p><strong>Theory:</strong> Systematic troubleshooting methodologies help identify and resolve network issues. Common tools include ping, traceroute, netstat, and protocol analyzers. Understanding common failure points speeds up problem resolution.</p>
        <p><strong>Practical:</strong> Use diagnostic tools to identify network problems, analyze packet captures, and implement solutions for common connectivity issues.</p>
        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded mt-2">
          <strong>Example:</strong> Given a network with connectivity issues, use systematic troubleshooting to identify a misconfigured router as the root cause.
        </div>

        <h3>📋 Hands-On Laboratory Exercises</h3>
        <ol className="list-decimal list-inside">
          <li><strong>Basic Network Configuration:</strong> Set up a small office network with routing and switching</li>
          <li><strong>Subnetting Practice:</strong> Design IP addressing schemes for various organizational needs</li>
          <li><strong>Router Configuration:</strong> Implement static and dynamic routing protocols</li>
          <li><strong>VLAN Implementation:</strong> Create and manage virtual LANs for network segmentation</li>
          <li><strong>Network Security:</strong> Configure firewalls, VPNs, and access control measures</li>
          <li><strong>Wireless Setup:</strong> Deploy and secure wireless networks</li>
          <li><strong>Troubleshooting:</strong> Diagnose and resolve various network problems</li>
          <li><strong>Network Monitoring:</strong> Implement monitoring solutions using SNMP and other tools</li>
        </ol>

        <h3>🔧 Tools & Technologies</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4>Simulation Tools:</h4>
            <ul className="list-disc list-inside">
              <li>Cisco Packet Tracer</li>
              <li>GNS3</li>
              <li>Wireshark</li>
              <li>VMware/VirtualBox</li>
            </ul>
          </div>
          <div>
            <h4>Hardware Platforms:</h4>
            <ul className="list-disc list-inside">
              <li>Cisco Routers & Switches</li>
              <li>Juniper Devices</li>
              <li>Wireless Access Points</li>
              <li>Network Interface Cards</li>
            </ul>
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mt-6">
          <h4 className="text-green-800 dark:text-green-200">💡 Real-World Applications</h4>
          <ul className="list-disc list-inside">
            <li>Enterprise network design and implementation</li>
            <li>Internet Service Provider infrastructure</li>
            <li>Cloud networking and data center design</li>
            <li>IoT and industrial network systems</li>
            <li>Network security and cybersecurity implementation</li>
          </ul>
        </div>
      </div>
    )
  };

  return <SyllabusTemplate subjectData={subjectData} />;
};

export default ComputerNetworkSyllabus;