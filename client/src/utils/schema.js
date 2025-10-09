/*
A small helper that converts React Flow nodes & edges into the canonical network JSON.
This is a starting point — extend with MAC generation, interface names, positions, etc.
*/

export function buildNetworkJSON(nodes, edges) {
  const devices = (nodes || []).map((n) => {
    return {
      id: n.id,
      type: n.data.deviceType,
      label: n.data.label,
      interfaces: n.data.interfaces || [],
      ports: n.data.ports,
      position: n.position,
    };
  });

  const connections = (edges || []).map((e) => {
    // react-flow edges have source (nodeId) and sourceHandle (if provided)
    return {
      id: e.id,
      from: { deviceId: e.source, port: e.sourceHandle || "eth0" },
      to: { deviceId: e.target, port: e.targetHandle || "eth0" },
      linkType: "copper",
    };
  });

  return {
    challenge: {
      id: "ch_local_1",
      title: "User sandbox",
      description: "User-generated topology",
      difficulty: "sandbox",
      requirements: [],
    },
    network: {
      devices,
      connections,
    },
    meta: {
      userId: "local_user",
      exportedAt: new Date().toISOString(),
    },
  };
}
