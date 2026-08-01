import unittest

from fastapi.testclient import TestClient

from app.main import app


class NetworkApiTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_root_endpoint_reports_project_status(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertIn("Internet Backbone & IXP Map", payload.get("name", ""))
        self.assertEqual(payload.get("status"), "running")

    def test_summary_endpoint_returns_network_metrics(self):
        response = self.client.get("/api/network/summary")
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertGreater(payload.get("backbone_nodes", 0), 0)
        self.assertGreater(payload.get("ixp_sites", 0), 0)
        self.assertGreater(payload.get("regions", 0), 0)


if __name__ == "__main__":
    unittest.main()
