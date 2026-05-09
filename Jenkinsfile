pipeline {
    agent any
    stages {
    	stage('Build & Deploy') {
            steps {
                sh """sudo -u ubuntu bash -c 'cd /home/antino/spare_space_frontend && bash deploy.sh'
                """
            }
        } 
        
    }
}
